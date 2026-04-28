import { ArrowLeft, Download, RefreshCcw, Wand2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import {
    useHtmlVariantQuery,
    useRegenerateHtmlVariantSectionMutation,
} from "../../hooks/useHtmlVariant";
import { useAuthStore } from "../../store/auth.store";
import { useToastStore } from "../../store/toast.store";
import { normalizeApiError } from "../../utils/api-error";
import { downloadHtmlVariant } from "../../utils/exporters";

const sections = [
    { value: "headline", label: "Headline" },
    { value: "subheadline", label: "Subheadline" },
    { value: "problem", label: "Problem" },
    { value: "solution", label: "Solution" },
    { value: "features", label: "Features" },
    { value: "benefits", label: "Benefits" },
    { value: "usp", label: "USP" },
    { value: "pricing", label: "Pricing" },
    { value: "testimonial", label: "Testimonial" },
    { value: "faq", label: "FAQ" },
    { value: "cta", label: "CTA" },
    { value: "footer", label: "Footer" },
];

export function HtmlVariantPreviewPage() {
    const token = useAuthStore((state) => state.token);
    const pushToast = useToastStore((state) => state.pushToast);
    const navigate = useNavigate();
    const params = useParams();

    const variantId = useMemo(() => {
        const raw = Number(params.id);
        return Number.isInteger(raw) && raw > 0 ? raw : null;
    }, [params.id]);

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [section, setSection] = useState("headline");
    const [prompt, setPrompt] = useState("");

    const { data: variant, isLoading } = useHtmlVariantQuery(
        variantId,
        Boolean(token),
    );
    const { mutateAsync: regenerateSection, isPending: regeneratePending } =
        useRegenerateHtmlVariantSectionMutation(variantId);

    if (!token) {
        return <Navigate to="/auth" replace />;
    }

    if (!variantId) {
        return <Navigate to="/" replace />;
    }

    const handleRegenerate = async (): Promise<void> => {
        if (!prompt.trim()) {
            pushToast("error", "Prompt section tidak boleh kosong.");
            return;
        }

        try {
            await regenerateSection({ section, prompt: prompt.trim() });
            pushToast("success", `Section "${section}" berhasil diregenerate.`);
            setPrompt("");
            setSidebarOpen(false);
        } catch (error) {
            pushToast("error", normalizeApiError(error).message);
        }
    };

    return (
        <main className="flex flex-col relative h-screen">
            <header className="block border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
                <div className="mx-auto flex items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                        <ArrowLeft size={15} />
                        <p className="hidden sm:block">Back</p>
                    </button>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                            <Wand2 size={15} />
                            Regenerate
                        </button>
                        <button
                            type="button"
                            disabled={!variant}
                            onClick={() => {
                                if (!variant) {
                                    return;
                                }
                                downloadHtmlVariant(
                                    variant.plain_html,
                                    variant.sales_page.product_name,
                                    variant.label,
                                );
                            }}
                            className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Download size={15} />
                            Download
                        </button>
                    </div>
                </div>
            </header>

            <section className="block flex-1 w-full relative">
                <div className="absolute w-full h-full">
                    {isLoading ? (
                        <p className="italic text-gray-500 text-center mt-3">
                            Loading ...
                        </p>
                    ) : null}

                    {!isLoading && variant ? (
                        <iframe
                            title={`Preview ${variant.label}`}
                            srcDoc={variant.plain_html}
                            className="h-full w-full"
                        />
                    ) : null}
                </div>
            </section>

            {sidebarOpen ? (
                <aside className="fixed inset-y-0 right-0 z-30 w-[min(420px,92vw)] border-l border-slate-200 bg-white p-4 shadow-xl">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-base font-semibold text-slate-900">
                            Regenerate Section
                        </h2>
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(false)}
                            className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div className="grid gap-3">
                        <label className="grid gap-1.5 text-sm font-medium text-slate-700">
                            Section
                            <select
                                value={section}
                                onChange={(event) =>
                                    setSection(event.target.value)
                                }
                                className="input"
                            >
                                {sections.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="grid gap-1.5 text-sm font-medium text-slate-700">
                            Prompt
                            <textarea
                                rows={8}
                                value={prompt}
                                onChange={(event) =>
                                    setPrompt(event.target.value)
                                }
                                placeholder="Contoh: Buat lebih santai tapi tetap profesional."
                                className="input"
                            />
                        </label>

                        <button
                            type="button"
                            disabled={regeneratePending}
                            onClick={() => {
                                void handleRegenerate();
                            }}
                            className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {regeneratePending ? (
                                <RefreshCcw
                                    size={15}
                                    className="animate-spin"
                                />
                            ) : (
                                <Wand2 size={15} />
                            )}
                            {regeneratePending
                                ? "Regenerating..."
                                : "Regenerate"}
                        </button>
                    </div>
                </aside>
            ) : null}
        </main>
    );
}

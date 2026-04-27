import {
    Eye,
    EyeOff,
    KeyRound,
    RefreshCcw,
    Save,
    Settings2,
    WalletCards,
} from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";

import { AppHeader } from "../../components/common/AppHeader";
import { useLogoutMutation } from "../../hooks/useAuthMutations";
import {
    useGeminiAccountQuery,
    useUpdateGeminiAccountMutation,
} from "../../hooks/useGeminiAccount";
import { useAuthStore } from "../../store/auth.store";
import { useToastStore } from "../../store/toast.store";
import { normalizeApiError } from "../../utils/api-error";

const architectureSections = [
    {
        title: "Routing Layer",
        points: [
            "React Router DOM with `AuthGuard`",
            "Separation between `/auth`, `/`, and `/architecture`",
        ],
    },
    {
        title: "Data Fetching",
        points: [
            "Axios instance + Bearer interceptor",
            "TanStack Query for caching, mutation, and invalidation",
        ],
    },
    {
        title: "State Management",
        points: [
            "Zustand persist store for auth session",
            "Toast store for global feedback notifications",
        ],
    },
    {
        title: "Scalable Structure",
        points: [
            "`api/`, `hooks/`, `interfaces/`, `store/`, `pages/`, `components/`",
            "Clear domain boundaries to improve maintainability",
        ],
    },
    {
        title: "UX & Delivery",
        points: [
            "Tailwind CSS utility-driven styling",
            "Skeleton state + success/error/info toast for clear feedback",
        ],
    },
];

export function ArchitecturePage() {
    const token = useAuthStore((state) => state.token);
    const user = useAuthStore((state) => state.user);
    const clearSession = useAuthStore((state) => state.clearSession);
    const pushToast = useToastStore((state) => state.pushToast);

    const [apiKey, setApiKey] = useState("");
    const [showApiKey, setShowApiKey] = useState(false);

    const { mutateAsync: logout, isPending: logoutPending } =
        useLogoutMutation();
    const { data: geminiSettings, isPending: geminiPending } =
        useGeminiAccountQuery(Boolean(token));
    const { mutateAsync: updateGeminiSettings, isPending: geminiSaving } =
        useUpdateGeminiAccountMutation();

    const lastSyncLabel = geminiSettings?.last_quota_synced_at
        ? new Date(geminiSettings.last_quota_synced_at).toLocaleString(
              "id-ID",
              {
                  dateStyle: "medium",
                  timeStyle: "short",
              },
          )
        : "-";

    const handleLogout = async (): Promise<void> => {
        try {
            await logout();
        } finally {
            clearSession();
        }
    };

    const handleSaveGeminiSettings = async (
        event: FormEvent<HTMLFormElement>,
    ): Promise<void> => {
        event.preventDefault();

        try {
            const formData = new FormData(event.currentTarget);
            const model =
                String(formData.get("model") ?? "").trim() ||
                "gemini-2.0-flash";
            const remainingQuotaRaw = String(
                formData.get("remaining_quota") ?? "",
            ).trim();

            let parsedRemainingQuota: number | null = null;
            if (remainingQuotaRaw !== "") {
                parsedRemainingQuota = Number(remainingQuotaRaw);
                if (
                    !Number.isInteger(parsedRemainingQuota) ||
                    parsedRemainingQuota < 0
                ) {
                    pushToast(
                        "error",
                        "Remaining quota harus berupa angka bulat >= 0.",
                    );
                    return;
                }
            }

            const payload: {
                api_key?: string;
                model: string;
                remaining_quota: number | null;
            } = {
                model,
                remaining_quota: parsedRemainingQuota,
            };

            if (apiKey.trim() !== "") {
                payload.api_key = apiKey.trim();
            }

            await updateGeminiSettings(payload);
            setApiKey("");
            pushToast("success", "Gemini settings berhasil disimpan.");
        } catch (error) {
            pushToast("error", normalizeApiError(error).message);
        }
    };

    const handleClearApiKey = async (): Promise<void> => {
        try {
            await updateGeminiSettings({ clear_api_key: true });
            setApiKey("");
            pushToast("info", "Gemini API key berhasil dihapus.");
        } catch (error) {
            pushToast("error", normalizeApiError(error).message);
        }
    };

    const formSeed = `${geminiSettings?.updated_at ?? "fresh"}-${geminiSettings?.model ?? "gemini-2.0-flash"}-${geminiSettings?.remaining_quota ?? ""}`;

    return (
        <main className="mx-auto w-[min(1200px,95vw)] py-6">
            <AppHeader
                userName={user?.name ?? "Reviewer"}
                onLogout={() => {
                    void handleLogout();
                }}
                loading={logoutPending}
            />

            <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <form
                    key={formSeed}
                    onSubmit={handleSaveGeminiSettings}
                    className="grid gap-4"
                >
                    <div className="flex flex-col items-start md:flex-row md:items-center justify-between gap-3">
                        <div>
                            <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                                <Settings2 size={14} />
                                Gemini Settings
                            </p>
                            <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-900">
                                Credential & Quota
                            </h2>
                            <p className="mt-1 text-sm text-slate-600">
                                API key dan model Gemini disimpan di database
                                per user. Quota akan diupdate dari header
                                provider jika tersedia.
                            </p>
                        </div>
                        <button
                            type="submit"
                            disabled={geminiSaving}
                            className="text-nowrap flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {geminiSaving ? (
                                <RefreshCcw
                                    size={15}
                                    className="animate-spin"
                                />
                            ) : (
                                <Save size={15} />
                            )}
                            Save Settings
                        </button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                                Gemini API Key
                            </label>
                            <div className="relative mb-2">
                                <input
                                    value={apiKey}
                                    onChange={(event) =>
                                        setApiKey(event.target.value)
                                    }
                                    type={showApiKey ? "text" : "password"}
                                    placeholder={
                                        geminiSettings?.api_key_masked ??
                                        "Paste new API key"
                                    }
                                    className="input input-icon-right"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowApiKey((prev) => !prev)
                                    }
                                    className="absolute inset-y-0 right-2 my-auto inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                                    aria-label={
                                        showApiKey
                                            ? "Hide API key"
                                            : "Show API key"
                                    }
                                >
                                    {showApiKey ? (
                                        <EyeOff size={16} />
                                    ) : (
                                        <Eye size={16} />
                                    )}
                                </button>
                            </div>
                            <div className="flex items-center justify-between text-xs text-slate-500">
                                <span className="inline-flex items-center gap-1.5">
                                    <KeyRound size={13} />
                                    {geminiSettings?.has_api_key
                                        ? "API key tersedia"
                                        : "API key belum diisi"}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        void handleClearApiKey();
                                    }}
                                    className="rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                                >
                                    Clear Key
                                </button>
                            </div>
                        </div>

                        <div className="grid gap-3">
                            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
                                Gemini Model
                                <input
                                    name="model"
                                    defaultValue={
                                        geminiSettings?.model ??
                                        "gemini-2.0-flash"
                                    }
                                    placeholder="gemini-2.0-flash"
                                    className="input"
                                />
                            </label>

                            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
                                Remaining Quota
                                <input
                                    name="remaining_quota"
                                    defaultValue={
                                        geminiSettings?.remaining_quota ?? ""
                                    }
                                    inputMode="numeric"
                                    placeholder="example: 100"
                                    className="input"
                                />
                                <span className="flex gap-1.5 text-xs font-normal text-slate-500">
                                    <div className="py-1">
                                        <WalletCards size={13} />
                                    </div>
                                    Jika provider tidak mengirim quota
                                    remaining, sistem akan mengurangi 1/request
                                    sebagai estimasi.
                                </span>
                            </label>
                        </div>
                    </div>
                </form>

                <div className="mt-4 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 md:grid-cols-3">
                    <p>
                        <span className="font-semibold text-slate-800">
                            Current Model:
                        </span>{" "}
                        {geminiSettings?.model ?? "-"}
                    </p>
                    <p>
                        <span className="font-semibold text-slate-800">
                            Quota Remaining:
                        </span>{" "}
                        {geminiPending
                            ? "Loading..."
                            : (geminiSettings?.remaining_quota ?? "-")}
                    </p>
                    <p>
                        <span className="font-semibold text-slate-800">
                            Last Quota Sync:
                        </span>{" "}
                        {geminiPending ? "Loading..." : lastSyncLabel}
                    </p>
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {architectureSections.map((section) => (
                    <article
                        key={section.title}
                        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                    >
                        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                            {section.title}
                        </h2>
                        <ul className="mt-3 space-y-2 text-sm text-slate-700">
                            {section.points.map((point) => (
                                <li
                                    key={point}
                                    className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
                                >
                                    {point}
                                </li>
                            ))}
                        </ul>
                    </article>
                ))}
            </section>
        </main>
    );
}

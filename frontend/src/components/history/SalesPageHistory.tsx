import { Download, Edit2, ExternalLink, Search, Trash2 } from "lucide-react";

import type { SalesPage } from "../../interfaces/sales-page";

interface SalesPageHistoryProps {
    pages: SalesPage[];
    selectedId: number | null;
    search: string;
    loading: boolean;
    onSearchChange: (value: string) => void;
    onSelect: (page: SalesPage) => void;
    onDelete: (id: number) => void;
    onOpenVariant: (plainHtml: string) => void;
    onDownloadVariant: (
        plainHtml: string,
        productName: string,
        variantLabel: string,
    ) => void;
}

export function SalesPageHistory({
    pages,
    selectedId,
    search,
    loading,
    onSearchChange,
    onSelect,
    onDelete,
    onOpenVariant,
    onDownloadVariant,
}: SalesPageHistoryProps) {
    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                    Saved Pages
                </h2>
                <label className="relative block">
                    <Search
                        size={14}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                        value={search}
                        onChange={(event) => onSearchChange(event.target.value)}
                        placeholder="Search history"
                        className="input input-icon-left w-full sm:w-52"
                    />
                </label>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div
                            key={index}
                            className="animate-pulse rounded-xl border border-slate-200 bg-slate-50 p-4"
                        >
                            <div className="h-3 w-1/2 rounded bg-slate-200" />
                            <div className="mt-2 h-2.5 w-5/6 rounded bg-slate-200" />
                            <div className="mt-1 h-2.5 w-3/5 rounded bg-slate-200" />
                        </div>
                    ))}
                </div>
            ) : null}

            {!loading && pages.length === 0 ? (
                <p className="empty-state">No sales pages yet.</p>
            ) : null}

            {!loading && pages.length > 0 ? (
                <ul className="space-y-3">
                    {pages.map((page) => (
                        <li
                            key={page.id}
                            className={`rounded-xl border p-4 transition ${
                                selectedId === page.id
                                    ? "border-slate-900 bg-slate-50"
                                    : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-slate-900">
                                        {page.product_name}
                                    </p>
                                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600">
                                        {page.product_description}
                                    </p>
                                </div>
                                <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                                    {page.detected_language === "id"
                                        ? "ID"
                                        : "EN"}
                                </span>
                            </div>

                            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                                    Input Summary
                                </p>

                                <div className="grid gap-2 text-xs">
                                    <InfoLine
                                        label="Target Audience"
                                        value={page.target_audience || "-"}
                                    />
                                    <InfoLine
                                        label="Price"
                                        value={page.price || "-"}
                                    />
                                    <InfoLine
                                        label="Unique Selling Points"
                                        value={
                                            page.unique_selling_points || "-"
                                        }
                                    />
                                    <div>
                                        <p className="font-medium text-slate-700">
                                            Key Features
                                        </p>
                                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                                            {page.key_features?.length ? (
                                                page.key_features.map(
                                                    (feature) => (
                                                        <span
                                                            key={`${page.id}-${feature}`}
                                                            className="rounded-md border border-slate-300 bg-white px-2 py-0.5 text-[11px] text-slate-700"
                                                        >
                                                            {feature}
                                                        </span>
                                                    ),
                                                )
                                            ) : (
                                                <span className="text-slate-500">
                                                    -
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                                <div className="mb-2 flex items-center justify-between">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                                        Live Preview
                                    </p>
                                    <span className="text-[10px] text-slate-500">
                                        {page.html_variants?.length ?? 0} refs
                                    </span>
                                </div>

                                {page.html_variants?.length ? (
                                    <div className="grid gap-1.5 sm:grid-cols-2">
                                        {page.html_variants.map(
                                            (variant, index) => (
                                                <div
                                                    key={`${page.id}-${variant.label}-${index}`}
                                                    className="rounded-md border border-slate-200 bg-white p-2"
                                                >
                                                    <p className="mb-1 truncate text-xs font-medium text-slate-700">
                                                        {variant.label}
                                                    </p>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                onOpenVariant(
                                                                    variant.plain_html,
                                                                )
                                                            }
                                                            className="inline-flex flex-1 items-center justify-center gap-1 rounded border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-600 transition hover:bg-slate-100"
                                                        >
                                                            <ExternalLink
                                                                size={11}
                                                            />
                                                            Open
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                onDownloadVariant(
                                                                    variant.plain_html,
                                                                    page.product_name,
                                                                    variant.label,
                                                                )
                                                            }
                                                            className="inline-flex flex-1 items-center justify-center gap-1 rounded border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-600 transition hover:bg-slate-100"
                                                        >
                                                            <Download size={11} />
                                                            Download
                                                        </button>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-500">
                                        No HTML references available.
                                    </p>
                                )}
                            </div>

                            <div className="mt-3 flex items-center justify-end gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => onSelect(page)}
                                    className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-amber-50 hover:text-amber-700"
                                >
                                    <Edit2 size={13} />
                                    Regenerate
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onDelete(page.id)}
                                    className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-rose-50 hover:text-rose-700"
                                >
                                    <Trash2 size={13} />
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : null}
        </article>
    );
}

function InfoLine({ label, value }: { label: string; value: string }) {
    return (
        <p className="text-xs text-slate-700">
            <span className="font-medium text-slate-800">{label}:</span> {value}
        </p>
    );
}

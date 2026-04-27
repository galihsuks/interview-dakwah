import { ExternalLink, Globe2, Layers } from 'lucide-react';

import type { SalesPage } from '../../interfaces/sales-page';

interface SalesPagePreviewProps {
  page: SalesPage | null;
  loading: boolean;
  onOpenVariant: (plainHtml: string) => void;
}

export function SalesPagePreview({ page, loading, onOpenVariant }: SalesPagePreviewProps) {
  const variants = page?.html_variants ?? [];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">Live Preview</h2>
        {page?.detected_language ? (
          <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
            <Globe2 size={12} />
            {page.detected_language === 'id' ? 'Indonesian' : 'English'}
          </span>
        ) : null}
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="grid animate-pulse gap-2 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="h-2.5 w-1/3 rounded bg-slate-200" />
                <div className="mt-2 h-3.5 w-4/5 rounded bg-slate-200" />
              </div>
            ))}
          </div>
          <div className="h-44 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
        </div>
      ) : null}

      {!loading && !page ? <p className="empty-state">Generate or select history to see preview references.</p> : null}

      {!loading && page ? (
        <>
          <div className="mb-4 grid gap-2 md:grid-cols-2">
            <InfoCard label="Product / Service" value={page.product_name} />
            <InfoCard label="Target Audience" value={page.target_audience ?? '-'} />
            <InfoCard label="Price" value={page.price ?? '-'} />
            <InfoCard label="USP" value={page.unique_selling_points ?? '-'} />
          </div>

          <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Product Description</p>
            <p className="mt-1 text-sm text-slate-700">{page.product_description}</p>
          </div>

          <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Key Features</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(page.key_features ?? []).map((feature) => (
                <span key={feature} className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700">
                  {feature}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="mb-3 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
              <Layers size={13} />
              4 HTML References
            </p>

            <div className="grid gap-2 md:grid-cols-2">
              {variants.map((variant, index) => (
                <button
                  key={`${variant.label}-${index}`}
                  type="button"
                  onClick={() => onOpenVariant(variant.plain_html)}
                  className="group flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                >
                  <span>{variant.label}</span>
                  <ExternalLink size={14} className="text-slate-500 transition group-hover:text-slate-700" />
                </button>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}

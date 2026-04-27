import type { ReactNode } from 'react';

import { PlusCircle } from 'lucide-react';

import type { SalesFormState } from '../../interfaces/sales-page';
import { formatThousandCurrencyInput } from '../../utils/currency';
import { TagMultiInput } from './TagMultiInput';

interface SalesPageFormProps {
  form: SalesFormState;
  mode: 'create' | 'update';
  loading: boolean;
  onChange: (patch: Partial<SalesFormState>) => void;
  onSubmit: () => void;
  onReset: () => void;
}

export function SalesPageForm({ form, mode, loading, onChange, onSubmit, onReset }: SalesPageFormProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">{mode === 'create' ? 'New Sales Page' : 'Regenerate Sales Page'}</h2>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <PlusCircle size={15} />
          New Draft
        </button>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
        className="grid gap-3"
      >
        <Field label="Product / Service Name">
          <input
            required
            value={form.product_name}
            onChange={(event) => onChange({ product_name: event.target.value })}
            className="input"
          />
        </Field>

        <Field label="Product Description">
          <textarea
            required
            rows={4}
            value={form.product_description}
            onChange={(event) => onChange({ product_description: event.target.value })}
            className="input"
          />
        </Field>

        <Field label="Key Features">
          <TagMultiInput
            value={form.key_features}
            onChange={(nextFeatures) => onChange({ key_features: nextFeatures })}
            placeholder="Type and press Enter"
          />
        </Field>

        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Target Audience">
            <input
              value={form.target_audience}
              onChange={(event) => onChange({ target_audience: event.target.value })}
              className="input"
            />
          </Field>

          <Field label="Price">
            <input
              value={form.price}
              onChange={(event) => onChange({ price: formatThousandCurrencyInput(event.target.value) })}
              className="input"
            />
          </Field>
        </div>

        <Field label="Unique Selling Points">
          <textarea
            rows={3}
            value={form.unique_selling_points}
            onChange={(event) => onChange({ unique_selling_points: event.target.value })}
            className="input"
          />
        </Field>

        <button
          type="submit"
          disabled={loading}
          className="mt-1 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Generating...' : mode === 'create' ? 'Generate Sales Page' : 'Regenerate Sales Page'}
        </button>
      </form>
    </article>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-slate-700">
      {label}
      {children}
    </label>
  );
}

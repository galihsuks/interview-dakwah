import { X } from 'lucide-react';
import type { KeyboardEvent } from 'react';
import { useState } from 'react';

interface TagMultiInputProps {
  value: string[];
  placeholder?: string;
  onChange: (nextValue: string[]) => void;
}

function normalizeTag(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export function TagMultiInput({
  value,
  onChange,
  placeholder = 'Type feature and press Enter',
}: TagMultiInputProps) {
  const [draft, setDraft] = useState('');

  const addTag = (rawValue: string): void => {
    const nextTag = normalizeTag(rawValue);
    if (!nextTag) {
      return;
    }

    const alreadyExists = value.some((item) => item.toLowerCase() === nextTag.toLowerCase());
    if (alreadyExists) {
      return;
    }

    onChange([...value, nextTag]);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter' || event.key === ',' || event.key === 'Tab') {
      if (!draft.trim()) {
        return;
      }

      event.preventDefault();
      addTag(draft);
      setDraft('');
      return;
    }

    if (event.key === 'Backspace' && !draft && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 transition focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-200">
      <div className="flex flex-wrap items-center gap-2">
        {value.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700"
          >
            {item}
            <button
              type="button"
              onClick={() => onChange(value.filter((valueItem) => valueItem !== item))}
              className="rounded-sm p-0.5 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
              aria-label={`Remove ${item}`}
            >
              <X size={12} />
            </button>
          </span>
        ))}

        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (!draft.trim()) {
              return;
            }

            addTag(draft);
            setDraft('');
          }}
          placeholder={value.length === 0 ? placeholder : ''}
          className="min-w-[180px] flex-1 border-none bg-transparent px-1 py-1 text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />
      </div>
    </div>
  );
}

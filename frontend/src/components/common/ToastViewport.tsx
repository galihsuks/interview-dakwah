import { CheckCircle2, CircleAlert, Info, X } from 'lucide-react';
import { useEffect } from 'react';

import { useToastStore } from '../../store/toast.store';

const toastStyleByType = {
  success: {
    icon: CheckCircle2,
    className: 'border-slate-300 bg-white text-slate-800',
  },
  error: {
    icon: CircleAlert,
    className: 'border-slate-300 bg-white text-slate-800',
  },
  info: {
    icon: Info,
    className: 'border-slate-300 bg-white text-slate-800',
  },
} as const;

export function ToastViewport() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  useEffect(() => {
    if (toasts.length === 0) {
      return;
    }

    const timeoutIds = toasts.map((toast) => {
      return window.setTimeout(() => {
        removeToast(toast.id);
      }, 3200);
    });

    return () => {
      timeoutIds.forEach((id) => window.clearTimeout(id));
    };
  }, [removeToast, toasts]);

  return (
    <aside className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(340px,92vw)] flex-col gap-2">
      {toasts.map((toast) => {
        const config = toastStyleByType[toast.type];
        const Icon = config.icon;

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-2 rounded-lg border px-3 py-2 text-sm shadow-sm ${config.className}`}
          >
            <Icon size={16} className="mt-0.5 shrink-0" />
            <p className="grow">{toast.message}</p>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="rounded-md p-0.5 transition hover:bg-slate-100"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </aside>
  );
}

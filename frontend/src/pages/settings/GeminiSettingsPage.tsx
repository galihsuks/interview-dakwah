import {
    Eye,
    EyeOff,
    KeyRound,
    RefreshCcw,
    Save,
    Settings2,
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

export function GeminiSettingsPage() {
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
            const payload: {
                api_key?: string;
            } = {};

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

    const formSeed = `${geminiSettings?.updated_at ?? "fresh"}-${geminiSettings?.model ?? "gemini-3-flash-preview"}`;
    const lastSyncLabel = geminiSettings?.last_quota_synced_at
        ? new Date(geminiSettings.last_quota_synced_at).toLocaleString(
              "id-ID",
              {
                  dateStyle: "medium",
                  timeStyle: "short",
              },
          )
        : "-";

    const rpmRemaining = geminiSettings?.rpm ? 5 - geminiSettings?.rpm : 0;
    const rpdRemaining = geminiSettings?.rpd ? 20 - geminiSettings?.rpd : 0;
    const tpmRemaining = geminiSettings?.tpm
        ? 250000 - geminiSettings?.tpm
        : 0;

    const metricItems = [
        {
            label: "RPM",
            remaining: rpmRemaining,
            max: 5,
            display: `${rpmRemaining} / 5`,
        },
        {
            label: "TPM",
            remaining: tpmRemaining,
            max: 250000,
            display:
                tpmRemaining >= 1000
                    ? `${tpmRemaining % 1000 === 0 ? tpmRemaining / 1000 : (tpmRemaining / 1000).toFixed(1)}K / 250K`
                    : `${tpmRemaining} / 250K`,
        },
        {
            label: "RPD",
            remaining: rpdRemaining,
            max: 20,
            display: `${rpdRemaining} / 20`,
        },
    ];

    return (
        <main className="mx-auto w-[min(1200px,95vw)] py-6">
            <AppHeader
                userName={user?.name ?? "Reviewer"}
                onLogout={() => {
                    void handleLogout();
                }}
                loading={logoutPending}
            />

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <form
                    key={formSeed}
                    onSubmit={handleSaveGeminiSettings}
                    className="grid gap-4"
                >
                    <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
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
                                per user.
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
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
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

                        <div>
                            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
                                Gemini Model
                                <input
                                    value={
                                        geminiSettings?.model ??
                                        "gemini-3-flash-preview"
                                    }
                                    readOnly
                                    className="input cursor-not-allowed bg-slate-100 text-slate-500"
                                />
                            </label>
                        </div>
                    </div>
                </form>

                <div className="mt-4 rounded-2xl border border-slate-100 p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between flex-col md:flex-row">
                        <h3 className="text-sm font-semibold tracking-wide">
                            Usage Quota
                        </h3>
                        <span className="text-xs text-slate-400">
                            Last Sync:{" "}
                            {geminiPending ? "Loading..." : lastSyncLabel}
                        </span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        {metricItems.map((metric) => {
                            const ratio = Math.min(
                                Math.max(metric.remaining / metric.max, 0),
                                1,
                            );

                            return (
                                <article
                                    key={metric.label}
                                    className="rounded-xl border border-slate-100 p-3"
                                >
                                    <p className="mb-2 text-xs font-semibold tracking-[0.12em] text-slate-500">
                                        {metric.label}
                                    </p>
                                    <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                                        <div
                                            className="h-full rounded-full bg-slate-700 transition-all"
                                            style={{ width: `${ratio * 100}%` }}
                                        />
                                    </div>
                                    <p className="text-sm font-semibold text-slate-500">
                                        {geminiPending
                                            ? "Loading..."
                                            : metric.display}
                                    </p>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </section>
        </main>
    );
}

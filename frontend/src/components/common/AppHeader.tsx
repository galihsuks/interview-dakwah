import { LogOut, Sparkles } from "lucide-react";
import { NavLink } from "react-router-dom";

interface AppHeaderProps {
    userName: string;
    onLogout: () => void;
    loading?: boolean;
}

export function AppHeader({
    userName,
    onLogout,
    loading = false,
}: AppHeaderProps) {
    return (
        <header className="mb-6 flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-start md:justify-between">
            <div>
                <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    <Sparkles size={14} />
                    Option B
                </p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-[30px]">
                    AI Sales Page Generator
                </h1>
                <p className="mt-2 text-sm text-slate-600 md:text-base">
                    Welcome, {userName}. Build, regenerate, and export.
                </p>
                <nav className="mt-4 flex items-center gap-2 flex-wrap">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `rounded-md border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition ${
                                isActive
                                    ? "border-slate-300 bg-slate-900 text-white"
                                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                            }`
                        }
                    >
                        Workspace
                    </NavLink>
                    <NavLink
                        to="/architecture"
                        className={({ isActive }) =>
                            `rounded-md border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition ${
                                isActive
                                    ? "border-slate-300 bg-slate-900 text-white"
                                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                            }`
                        }
                    >
                        Architecture
                    </NavLink>
                    <NavLink
                        to="/settings/gemini"
                        className={({ isActive }) =>
                            `rounded-md border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition ${
                                isActive
                                    ? "border-slate-300 bg-slate-900 text-white"
                                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                            }`
                        }
                    >
                        Settings
                    </NavLink>
                </nav>
            </div>

            <button
                type="button"
                onClick={onLogout}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
                <LogOut size={16} />
                Logout
            </button>
        </header>
    );
}

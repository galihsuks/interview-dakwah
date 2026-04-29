import {
    BookOpen,
    LayoutDashboard,
    Logs,
    Menu,
    Settings,
    X,
    LogOut,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { NavLink } from "react-router-dom";

import { useLogoutMutation } from "../../hooks/useAuthMutations";
import { useAuthStore } from "../../store/auth.store";

interface AppSidebarLayoutProps {
    title: string;
    subtitle?: string;
    children: ReactNode;
}

const navItems = [
    { to: "/", label: "Workspace", icon: LayoutDashboard },
    { to: "/architecture", label: "Architecture", icon: BookOpen },
    { to: "/settings/gemini", label: "Settings", icon: Settings },
    { to: "/logs", label: "Logs", icon: Logs },
];

export function AppSidebarLayout({
    title,
    subtitle,
    children,
}: AppSidebarLayoutProps) {
    const user = useAuthStore((state) => state.user);
    const clearSession = useAuthStore((state) => state.clearSession);
    const { mutateAsync: logout, isPending: logoutPending } =
        useLogoutMutation();
    const [open, setOpen] = useState(false);

    const handleLogout = async (): Promise<void> => {
        try {
            await logout();
        } finally {
            clearSession();
        }
    };

    return (
        <main className="min-h-screen bg-slate-100">
            <div className="mx-auto flex min-h-screen">
                <aside
                    className={`fixed inset-y-0 left-0 z-30 w-72 border-r border-slate-200 bg-white p-4 shadow-lg transition-transform md:static md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
                >
                    <div className="sticky top-4">
                        <div className="mb-6 flex items-center justify-between md:justify-start">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                                    Option B
                                </p>
                                <h1 className="text-lg font-semibold text-slate-900">
                                    AI Sales Page
                                </h1>
                            </div>
                            <button
                                type="button"
                                className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 md:hidden"
                                onClick={() => setOpen(false)}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <nav className="grid gap-1.5">
                            {navItems.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        className={({ isActive }) =>
                                            `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                                                isActive
                                                    ? "bg-slate-900 text-white"
                                                    : "text-slate-700 hover:bg-slate-100"
                                            }`
                                        }
                                        onClick={() => setOpen(false)}
                                    >
                                        <Icon size={15} />
                                        {item.label}
                                    </NavLink>
                                );
                            })}
                        </nav>

                        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <p className="text-xs text-slate-500">
                                Signed in as
                            </p>
                            <p className="truncate text-sm font-semibold text-slate-800">
                                {user?.name ?? "User"}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                void handleLogout();
                            }}
                            disabled={logoutPending}
                            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <LogOut size={15} />
                            Logout
                        </button>
                    </div>
                </aside>

                {open ? (
                    <button
                        type="button"
                        className="fixed inset-0 z-20 bg-black/30 md:hidden"
                        onClick={() => setOpen(false)}
                    />
                ) : null}

                <section className="min-w-0 flex-1 p-4 md:p-6">
                    <div className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900 md:text-xl">
                                {title}
                            </h2>
                            {subtitle ? (
                                <p className="text-sm text-slate-600">
                                    {subtitle}
                                </p>
                            ) : null}
                        </div>
                        <button
                            type="button"
                            onClick={() => setOpen(true)}
                            className="rounded-md border border-slate-300 bg-white p-2 text-slate-700 transition hover:bg-slate-50 md:hidden"
                        >
                            <Menu size={16} />
                        </button>
                    </div>

                    {children}
                </section>
            </div>
        </main>
    );
}

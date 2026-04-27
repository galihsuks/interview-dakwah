import { Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";

import {
    useLoginMutation,
    useRegisterMutation,
} from "../../hooks/useAuthMutations";
import type { LoginPayload, RegisterPayload } from "../../interfaces/auth";
import { useAuthStore } from "../../store/auth.store";
import { useToastStore } from "../../store/toast.store";
import { normalizeApiError } from "../../utils/api-error";

type AuthMode = "login" | "register";

const initialRegisterForm: RegisterPayload = {
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
};

const initialLoginForm: LoginPayload = {
    email: "",
    password: "",
};

export function AuthPage() {
    const token = useAuthStore((state) => state.token);
    const setSession = useAuthStore((state) => state.setSession);
    const pushToast = useToastStore((state) => state.pushToast);

    const [mode, setMode] = useState<AuthMode>("login");
    const [loginForm, setLoginForm] = useState<LoginPayload>(initialLoginForm);
    const [registerForm, setRegisterForm] =
        useState<RegisterPayload>(initialRegisterForm);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { mutateAsync: login, isPending: loginPending } = useLoginMutation();
    const { mutateAsync: register, isPending: registerPending } =
        useRegisterMutation();

    const isLoading = loginPending || registerPending;

    const submitLabel = useMemo(() => {
        if (isLoading) {
            return "Please wait...";
        }

        return mode === "login" ? "Login" : "Create Account";
    }, [isLoading, mode]);

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>,
    ): Promise<void> => {
        event.preventDefault();
        setError("");

        try {
            if (mode === "login") {
                const response = await login(loginForm);
                setSession(response.token, response.user);
                return;
            }

            const response = await register(registerForm);
            setSession(response.token, response.user);
            setRegisterForm(initialRegisterForm);
        } catch (mutationError) {
            const normalizedError = normalizeApiError(mutationError);
            setError(normalizedError.message);
            pushToast("error", normalizedError.message);
        }
    };

    if (token) {
        return <Navigate to="/" replace />;
    }

    return (
        <main className="grid min-h-screen place-items-center px-4 py-10">
            <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    PT Dakwah Digital Network
                </p>
                <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                    Sales Page Workspace
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                    Login atau register untuk mulai generate sales page.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-2 rounded-lg border border-slate-200 bg-slate-50 p-1">
                    <button
                        type="button"
                        onClick={() => setMode("login")}
                        className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                            mode === "login"
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-slate-500 hover:text-slate-800"
                        }`}
                    >
                        <span className="inline-flex items-center gap-2">
                            <LogIn size={14} />
                            Login
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode("register")}
                        className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                            mode === "register"
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-slate-500 hover:text-slate-800"
                        }`}
                    >
                        <span className="inline-flex items-center gap-2">
                            <UserPlus size={14} />
                            Register
                        </span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 grid gap-3.5">
                    {mode === "register" ? (
                        <Field label="Full Name">
                            <input
                                required
                                value={registerForm.name}
                                onChange={(event) =>
                                    setRegisterForm((prev) => ({
                                        ...prev,
                                        name: event.target.value,
                                    }))
                                }
                                className="input"
                            />
                        </Field>
                    ) : null}

                    <Field label="Email">
                        <input
                            required
                            type="email"
                            value={
                                mode === "login"
                                    ? loginForm.email
                                    : registerForm.email
                            }
                            onChange={(event) => {
                                const email = event.target.value;
                                if (mode === "login") {
                                    setLoginForm((prev) => ({
                                        ...prev,
                                        email,
                                    }));
                                    return;
                                }
                                setRegisterForm((prev) => ({ ...prev, email }));
                            }}
                            className="input"
                        />
                    </Field>

                    <Field label="Password">
                        <div className="relative">
                            <input
                                required
                                type={showPassword ? "text" : "password"}
                                value={
                                    mode === "login"
                                        ? loginForm.password
                                        : registerForm.password
                                }
                                onChange={(event) => {
                                    const password = event.target.value;
                                    if (mode === "login") {
                                        setLoginForm((prev) => ({
                                            ...prev,
                                            password,
                                        }));
                                        return;
                                    }
                                    setRegisterForm((prev) => ({
                                        ...prev,
                                        password,
                                    }));
                                }}
                className="input input-icon-right"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute inset-y-0 right-2 my-auto inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >
                                {showPassword ? (
                                    <EyeOff size={16} />
                                ) : (
                                    <Eye size={16} />
                                )}
                            </button>
                        </div>
                    </Field>

                    {mode === "register" ? (
                        <Field label="Confirm Password">
                            <div className="relative">
                                <input
                                    required
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={registerForm.password_confirmation}
                                    onChange={(event) =>
                                        setRegisterForm((prev) => ({
                                            ...prev,
                                            password_confirmation:
                                                event.target.value,
                                        }))
                                    }
                  className="input input-icon-right"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword((prev) => !prev)
                                    }
                                    className="absolute inset-y-0 right-2 my-auto inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                                    aria-label={
                                        showConfirmPassword
                                            ? "Hide confirm password"
                                            : "Show confirm password"
                                    }
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff size={16} />
                                    ) : (
                                        <Eye size={16} />
                                    )}
                                </button>
                            </div>
                        </Field>
                    ) : null}

                    {error ? (
                        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                            {error}
                        </p>
                    ) : null}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="mt-1 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {submitLabel}
                    </button>
                </form>
            </section>
        </main>
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

import { Search } from "lucide-react";
import { Navigate } from "react-router-dom";
import { useMemo, useState } from "react";

import { AppSidebarLayout } from "../../components/common/AppSidebarLayout";
import { useLogsQuery } from "../../hooks/useLogs";
import { useAuthStore } from "../../store/auth.store";

export function LogsPage() {
    const token = useAuthStore((state) => state.token);

    const [date, setDate] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [keyword, setKeyword] = useState("");
    const [page, setPage] = useState(1);

    const params = useMemo(
        () => ({
            date: date || undefined,
            start_date: startDate || undefined,
            end_date: endDate || undefined,
            keyword: keyword || undefined,
            page,
            per_page: 10,
        }),
        [date, startDate, endDate, keyword, page],
    );

    const { data, isLoading } = useLogsQuery(Boolean(token), params);

    if (!token) {
        return <Navigate to="/auth" replace />;
    }

    const pagination = data?.pagination;

    return (
        <AppSidebarLayout
            title="Logs"
            subtitle="Database logs for the current signed-in user."
        >
            <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="grid gap-3 md:grid-cols-4">
                    <label className="grid gap-1 text-xs font-medium text-slate-600">
                        Date
                        <input
                            type="date"
                            value={date}
                            onChange={(event) => {
                                setDate(event.target.value);
                                setPage(1);
                            }}
                            className="input"
                        />
                    </label>
                    <label className="grid gap-1 text-xs font-medium text-slate-600">
                        Start Date
                        <input
                            type="date"
                            value={startDate}
                            onChange={(event) => {
                                setStartDate(event.target.value);
                                setPage(1);
                            }}
                            className="input"
                        />
                    </label>
                    <label className="grid gap-1 text-xs font-medium text-slate-600">
                        End Date
                        <input
                            type="date"
                            value={endDate}
                            onChange={(event) => {
                                setEndDate(event.target.value);
                                setPage(1);
                            }}
                            className="input"
                        />
                    </label>
                    <label className="grid gap-1 text-xs font-medium text-slate-600">
                        Keyword
                        <div className="relative">
                            <Search
                                size={14}
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                                value={keyword}
                                onChange={(event) => {
                                    setKeyword(event.target.value);
                                    setPage(1);
                                }}
                                placeholder="Search message/context"
                                className="input input-icon-left"
                            />
                        </div>
                    </label>
                </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                {isLoading ? (
                    <p className="text-sm text-slate-500">Loading logs...</p>
                ) : null}

                {!isLoading && (data?.items.length ?? 0) === 0 ? (
                    <p className="text-sm text-slate-500">No logs found.</p>
                ) : null}

                {!isLoading && (data?.items.length ?? 0) > 0 ? (
                    <div
                        className="rounded-xl border border-slate-200"
                        style={{ overflowX: "scroll" }}
                    >
                        <table className="min-w-[980px] table-fixed divide-y divide-slate-200 text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="w-40 px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                                        Date
                                    </th>
                                    <th className="w-24 px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                                        Level
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                                        Log Line
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {data?.items.map((log) => (
                                    <tr key={log.id} className="align-top">
                                        <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-500">
                                            {new Date(
                                                log.created_at,
                                            ).toLocaleString("id-ID", {
                                                timeZone: "Asia/Jakarta",
                                            })}
                                        </td>
                                        <td className="px-3 py-2">
                                            <span
                                                className={`rounded px-2 py-0.5 text-[11px] font-semibold uppercase ${
                                                    log.level === "error"
                                                        ? "bg-rose-100 text-rose-700"
                                                        : log.level ===
                                                            "warning"
                                                          ? "bg-amber-100 text-amber-700"
                                                          : "bg-sky-100 text-sky-700"
                                                }`}
                                            >
                                                {log.level}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-xs text-slate-700">
                                            <span className="font-medium">
                                                {log.message}
                                            </span>{" "}
                                            <span className="text-slate-500">
                                                {JSON.stringify(log.context)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : null}

                {pagination ? (
                    <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                        <p>
                            Page {pagination.page} of{" "}
                            {pagination.last_page || 1} - Total{" "}
                            {pagination.total}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={pagination.page <= 1}
                                onClick={() =>
                                    setPage((prev) => Math.max(prev - 1, 1))
                                }
                                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 disabled:opacity-50"
                            >
                                Prev
                            </button>
                            <button
                                type="button"
                                disabled={
                                    pagination.page >= pagination.last_page
                                }
                                onClick={() => setPage((prev) => prev + 1)}
                                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                ) : null}
            </section>
        </AppSidebarLayout>
    );
}

import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { AppHeader } from "../../components/common/AppHeader";
import { SalesPageForm } from "../../components/forms/SalesPageForm";
import { SalesPageHistory } from "../../components/history/SalesPageHistory";
import { useLogoutMutation } from "../../hooks/useAuthMutations";
import {
    useCreateSalesPageMutation,
    useDeleteSalesPageMutation,
    useSalesPagesQuery,
    useUpdateSalesPageMutation,
} from "../../hooks/useSalesPages";
import type {
    SalesFormState,
    SalesPagePayload,
} from "../../interfaces/sales-page";
import { useAuthStore } from "../../store/auth.store";
import { useToastStore } from "../../store/toast.store";
import { normalizeApiError } from "../../utils/api-error";
import { downloadHtmlVariant } from "../../utils/exporters";

const initialForm: SalesFormState = {
    product_name: "",
    product_description: "",
    key_features: [],
    target_audience: "",
    price: "",
    unique_selling_points: "",
};

export function DashboardPage() {
    const token = useAuthStore((state) => state.token);
    const user = useAuthStore((state) => state.user);
    const clearSession = useAuthStore((state) => state.clearSession);
    const pushToast = useToastStore((state) => state.pushToast);
    const navigate = useNavigate();

    const [form, setForm] = useState<SalesFormState>(initialForm);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [search, setSearch] = useState("");

    const {
        data: salesData,
        isLoading: salesLoading,
        isError: salesError,
        error: salesErrorData,
    } = useSalesPagesQuery(Boolean(token));

    const { mutateAsync: createSalesPage, isPending: createSalesPending } =
        useCreateSalesPageMutation();
    const { mutateAsync: updateSalesPage, isPending: updateSalesPending } =
        useUpdateSalesPageMutation();
    const { mutateAsync: deleteSalesPage } = useDeleteSalesPageMutation();
    const { mutateAsync: logout, isPending: logoutPending } =
        useLogoutMutation();

    const isSubmitting = createSalesPending || updateSalesPending;

    const filteredPages = useMemo(() => {
        const pages = salesData ?? [];
        const query = search.trim().toLowerCase();

        if (!query) {
            return pages;
        }

        return pages.filter((page) => {
            return (
                page.product_name.toLowerCase().includes(query) ||
                (page.detected_language ?? "").toLowerCase().includes(query) ||
                (page.target_audience ?? "").toLowerCase().includes(query)
            );
        });
    }, [salesData, search]);

    const effectiveSelectedId = useMemo(() => {
        const pages = salesData ?? [];

        const hasSelected =
            selectedId !== null && pages.some((page) => page.id === selectedId);
        if (hasSelected) {
            return selectedId;
        }

        return null;
    }, [salesData, selectedId]);

    useEffect(() => {
        if (salesError) {
            pushToast("error", normalizeApiError(salesErrorData).message);
        }
    }, [pushToast, salesError, salesErrorData]);

    if (!token || !user) {
        return <Navigate to="/auth" replace />;
    }

    const patchForm = (patch: Partial<SalesFormState>): void => {
        setForm((prev) => ({ ...prev, ...patch }));
    };

    const formToPayload = (): SalesPagePayload => ({
        product_name: form.product_name,
        product_description: form.product_description,
        key_features: form.key_features,
        target_audience: form.target_audience,
        price: form.price,
        unique_selling_points: form.unique_selling_points,
    });

    const handleSubmit = async (): Promise<void> => {
        try {
            if (!effectiveSelectedId) {
                const created = await createSalesPage(formToPayload());
                setSelectedId(created.id);
                pushToast("success", "4 sales-page references generated.");
                return;
            }

            await updateSalesPage({
                id: effectiveSelectedId,
                payload: formToPayload(),
            });
            pushToast("success", "Sales-page references regenerated.");
            handleReset();
        } catch (error) {
            pushToast("error", normalizeApiError(error).message);
        }
    };

    const handleSelect = (id: number): void => {
        const page = (salesData ?? []).find((item) => item.id === id);
        if (!page) {
            return;
        }

        setSelectedId(id);
        setForm({
            product_name: page.product_name,
            product_description: page.product_description,
            key_features: page.key_features,
            target_audience: page.target_audience ?? "",
            price: page.price ?? "",
            unique_selling_points: page.unique_selling_points ?? "",
        });
    };

    const handleDelete = async (id: number): Promise<void> => {
        try {
            await deleteSalesPage(id);
            if (effectiveSelectedId === id) {
                setSelectedId(null);
                setForm(initialForm);
            }
            pushToast("info", "Sales page deleted.");
        } catch (error) {
            pushToast("error", normalizeApiError(error).message);
        }
    };

    const handleLogout = async (): Promise<void> => {
        try {
            await logout();
        } finally {
            clearSession();
        }
    };

    const handleReset = () => {
        setSelectedId(null);
        setForm(initialForm);
    };

    return (
        <main className="mx-auto w-[min(1120px,94vw)] py-8">
            <AppHeader
                userName={user.name}
                onLogout={() => {
                    void handleLogout();
                }}
                loading={logoutPending}
            />

            <section className="mb-4 grid gap-4">
                <SalesPageForm
                    form={form}
                    mode={selectedId ? "update" : "create"}
                    loading={isSubmitting}
                    onChange={patchForm}
                    onSubmit={() => {
                        void handleSubmit();
                    }}
                    onReset={handleReset}
                />

                <SalesPageHistory
                    pages={filteredPages}
                    selectedId={effectiveSelectedId}
                    search={search}
                    loading={salesLoading}
                    onSearchChange={setSearch}
                    onSelect={(page) => handleSelect(page.id)}
                    onDelete={(id) => {
                        void handleDelete(id);
                    }}
                    onOpenVariant={(variantId) => {
                        navigate(`/preview/${variantId}`);
                    }}
                    onDownloadVariant={(
                        plainHtml,
                        productName,
                        variantLabel,
                    ) => {
                        downloadHtmlVariant(
                            plainHtml,
                            productName,
                            variantLabel,
                        );
                    }}
                />
            </section>
        </main>
    );
}

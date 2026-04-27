import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createSalesPage,
  deleteSalesPage,
  getSalesPages,
  updateSalesPage,
} from '../api/sales-pages.api';
import type { SalesPagePayload } from '../interfaces/sales-page';

const SALES_PAGES_QUERY_KEY = ['sales-pages'];

export function useSalesPagesQuery(enabled: boolean) {
  return useQuery({
    queryKey: SALES_PAGES_QUERY_KEY,
    queryFn: getSalesPages,
    enabled,
  });
}

export function useCreateSalesPageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SalesPagePayload) => createSalesPage(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SALES_PAGES_QUERY_KEY });
    },
  });
}

export function useUpdateSalesPageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: SalesPagePayload }) => updateSalesPage(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SALES_PAGES_QUERY_KEY });
    },
  });
}

export function useDeleteSalesPageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteSalesPage(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SALES_PAGES_QUERY_KEY });
    },
  });
}

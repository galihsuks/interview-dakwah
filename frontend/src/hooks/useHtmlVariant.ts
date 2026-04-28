import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getHtmlVariantById, regenerateHtmlVariantSection } from '../api/html-variants.api';

export function useHtmlVariantQuery(id: number | null, enabled: boolean) {
  return useQuery({
    queryKey: ['html-variant', id],
    queryFn: () => getHtmlVariantById(id as number),
    enabled: enabled && id !== null,
  });
}

export function useRegenerateHtmlVariantSectionMutation(id: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { section: string; prompt: string }) => regenerateHtmlVariantSection(id as number, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['html-variant', id] });
    },
  });
}

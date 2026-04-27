import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getGeminiAccountSettings, updateGeminiAccountSettings } from '../api/gemini-account.api';
import type { UpdateGeminiAccountPayload } from '../interfaces/gemini-account';

const GEMINI_ACCOUNT_QUERY_KEY = ['gemini-account'];

export function useGeminiAccountQuery(enabled: boolean) {
  return useQuery({
    queryKey: GEMINI_ACCOUNT_QUERY_KEY,
    queryFn: getGeminiAccountSettings,
    enabled,
  });
}

export function useUpdateGeminiAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateGeminiAccountPayload) => updateGeminiAccountSettings(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: GEMINI_ACCOUNT_QUERY_KEY });
    },
  });
}

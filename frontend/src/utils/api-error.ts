import axios from 'axios';

import type { ApiErrorResponse } from '../interfaces/common';

export interface NormalizedApiError {
  message: string;
  fieldErrors: Record<string, string[]>;
}

export function normalizeApiError(error: unknown): NormalizedApiError {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const fieldErrors = error.response?.data?.errors ?? error.response?.data?.data?.errors ?? {};
    const firstFieldError = Object.values(fieldErrors)[0]?.[0];

    return {
      message: firstFieldError ?? error.response?.data?.message ?? 'Request failed.',
      fieldErrors,
    };
  }

  return {
    message: 'Unexpected error happened.',
    fieldErrors: {},
  };
}

export interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

export type Nullable<T> = T | null;

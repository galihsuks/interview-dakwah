export interface ApiErrorResponse {
  status?: number;
  message?: string;
  errors?: Record<string, string[]>;
  data?: {
    errors?: Record<string, string[]>;
  };
}

export type Nullable<T> = T | null;

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

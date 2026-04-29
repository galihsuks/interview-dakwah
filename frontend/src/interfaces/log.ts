export interface LogItem {
  id: string;
  user_id: number | null;
  level: 'info' | 'warning' | 'error' | string;
  message: string;
  context: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface LogsPagination {
  page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface LogsResponseData {
  items: LogItem[];
  pagination: LogsPagination;
}

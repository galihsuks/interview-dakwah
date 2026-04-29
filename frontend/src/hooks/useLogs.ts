import { useQuery } from '@tanstack/react-query';

import { getLogs, type LogsQueryParams } from '../api/logs.api';

export function useLogsQuery(enabled: boolean, params: LogsQueryParams) {
  return useQuery({
    queryKey: ['logs', params],
    queryFn: () => getLogs(params),
    enabled,
  });
}

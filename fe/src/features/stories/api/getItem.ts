import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { hnItem } from '@/types/hnItem';

export const fetchItem = (id: number): Promise<hnItem[]> =>
  api.get(`/item/${id}`);

export const useItem = (id: number | null) => {
  return useQuery({
    queryKey: ['item', id],
    queryFn: () => fetchItem(id as number),
    enabled: typeof id === 'number' && id > 0,
    staleTime: 30000,
  });
};

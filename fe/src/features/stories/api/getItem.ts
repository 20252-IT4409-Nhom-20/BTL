import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { hnItem } from '@/features/stories/types/hnItem';

export const fetchItem = (id: number): Promise<hnItem> => api.get(`/item/${id}.json`);

export const useItem = (id: number | null) => {
  return useQuery({
    queryKey: ['item', id],
    queryFn: () => fetchItem(id as number),
    enabled: typeof id === 'number' && id > 0,
  });
};

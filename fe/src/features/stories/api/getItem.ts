import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { hnItem } from '@/features/stories/types/hnItem';

export const fetchItem = (id: number): Promise<hnItem> => api.get(`/item/${id}.json`);

export const useItem = (id: number) => {
  return useQuery({
    queryKey: ['item', id],
    queryFn: () => fetchItem(id),
  });
};

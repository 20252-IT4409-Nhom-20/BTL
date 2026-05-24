import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { hnItem } from '@/types/hnItem';

type ItemResponse = { item: hnItem[] };

export const fetchItem = async (id: number): Promise<hnItem[]> => {
  const data = (await api.get(`/stories/item/${id}`)) as unknown as ItemResponse;
  return data.item;
};

export const useItem = (id: number | null) => {
  return useQuery({
    queryKey: ['item', id],
    queryFn: () => fetchItem(id as number),
    enabled: typeof id === 'number' && id > 0,
    staleTime: 30000,
  });
};

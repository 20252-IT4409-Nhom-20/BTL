import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { hnItem } from '@/types/hnItem';

type ItemResponse = { item: hnItem[] };

export const fetchItem = async (id: string): Promise<hnItem[]> => {
  const data = (await api.get(`/stories/item/${id}`)) as unknown as ItemResponse;
  return data.item;
};

export const useItem = (id: string | null) => {
  return useQuery({
    queryKey: ['item', id],
    queryFn: () => fetchItem(id as string),
    enabled: !!id,
    staleTime: 30000,
  });
};

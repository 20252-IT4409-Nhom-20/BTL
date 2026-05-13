import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { hnItem } from '@/features/stories/types/hnItem';

type ItemResponse = { item: hnItem };

export const fetchItem = async (id: number): Promise<hnItem> => {
  const data = (await api.get(`/stories/item/${id}`)) as unknown as ItemResponse;
  return data.item;
};

export const useItem = (id: number) => {
  return useQuery({
    queryKey: ['item', id],
    queryFn: () => fetchItem(id),
  });
};

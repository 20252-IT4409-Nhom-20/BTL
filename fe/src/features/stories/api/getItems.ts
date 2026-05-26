import { queryOptions, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { hnItem } from '@/types/hnItem';

export type StoryType = 'top' | 'new' | 'best' | 'ask' | 'show' | 'job';

type StoriesResponse = {
  type: StoryType;
  page: number;
  count: number;
  items: hnItem[];
};

export const fetchStoriesItems = async (
  type: StoryType,
  page: number,
  limit: number
): Promise<hnItem[]> => {
  const data = (await api.get(`/stories/${type}`, {
    params: { page, limit },
  })) as unknown as StoriesResponse;
  return data.items;
};

export const getStoriesItemsQueryOptions = (
  type: StoryType,
  page: number,
  limit: number
) => {
  return queryOptions({
    queryKey: ['stories', 'items', type, page, limit],
    queryFn: () => fetchStoriesItems(type, page, limit),
    enabled: page > 0 && limit > 0,
  });
};

export const useStoriesItems = (
  type: StoryType,
  page: number,
  limit: number
) => {
  return useQuery(getStoriesItemsQueryOptions(type, page, limit));
};

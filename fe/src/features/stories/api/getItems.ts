import { queryOptions, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { hnItem } from '@/types/hnItem';

const storyEndpoints = {
  top: '/topstories',
  new: '/newstories',
  best: '/beststories',
  ask: '/askstories',
  show: '/showstories',
  job: '/jobstories',
};

export const fetchStoriesItems = (
  type: keyof typeof storyEndpoints,
  page: number,
  limit: number
): Promise<hnItem[]> => {
  return api.get(`${storyEndpoints[type]}?page=${page}&limit=${limit}`);
};

export const getStoriesItemsQueryOptions = (
  type: keyof typeof storyEndpoints,
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
  type: keyof typeof storyEndpoints,
  page: number,
  limit: number
) => {
  return useQuery(getStoriesItemsQueryOptions(type, page, limit));
};

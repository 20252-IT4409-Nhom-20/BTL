import { queryOptions, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { hnItem } from '@/features/stories/types/hnItem';

export type StoryType = 'top' | 'new' | 'best' | 'ask' | 'show' | 'job';

type StoriesResponse = {
  type: StoryType;
  count: number;
  items: hnItem[];
};

export const getStories = (type: StoryType, limit = 30): Promise<StoriesResponse> =>
  api.get(`/stories/${type}`, { params: { limit } }) as unknown as Promise<StoriesResponse>;

export const getStoriesQueryOptions = (type: StoryType, limit = 30) => {
  return queryOptions({
    queryKey: ['stories', type, limit],
    queryFn: () => getStories(type, limit),
  });
};

export const useStories = (type: StoryType, limit = 30) => {
  return useQuery(getStoriesQueryOptions(type, limit));
};

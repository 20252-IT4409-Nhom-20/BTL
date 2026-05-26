import { queryOptions, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

const storyEndpoints = {
  top: '/topstories.json',
  new: '/newstories.json',
  best: '/beststories.json',
  ask: '/askstories.json',
  show: '/showstories.json',
  job: '/jobstories.json',
};

export const getStories = (type: keyof typeof storyEndpoints): Promise<number[]> =>
  api.get(storyEndpoints[type]);

export const getStoriesQueryOptions = (type: keyof typeof storyEndpoints) => {
  return queryOptions({
    queryKey: ['stories', type],
    queryFn: () => getStories(type),
  });
};

export const useStories = (type: keyof typeof storyEndpoints) => {
  return useQuery(getStoriesQueryOptions(type));
};

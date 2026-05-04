import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export const fetchTopStories = () => api.get('/topstories.json');

export const useTopStories = () => {
  return useQuery({
    queryKey: ['topstories'],
    queryFn: fetchTopStories,
  });
};

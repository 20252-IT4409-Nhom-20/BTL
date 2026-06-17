import { api } from '@/lib/api-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export type SubmitStoryDTO = {
  title: string;
  url?: string;
  text?: string;
  type: string;
};

export const submitStory = async (data: SubmitStoryDTO) => {
  return await api.post('/stories', data);
};

export const useSubmitStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitStory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });
};

import { api } from '@/lib/api-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const deleteStory = async (id: string): Promise<void> => {
  return await api.delete(`/stories/${id}`);
};

export const useDeleteStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteStory,
    onSuccess: () => {
      // Invalidate stories list cache
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });
};

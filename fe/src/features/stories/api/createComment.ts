import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export type CreateCommentDTO = {
  text: string;
  parent_id: string | number;
  root_id: string | number;
};

export const createComment = async (data: CreateCommentDTO) => {
  return await api.post('/comments', data);
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createComment,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['item', variables.root_id] });
    },
  });
};

import { api } from '@/lib/api-client';

export const voteStory = async (id: string): Promise<void> => {
  return await api.put(`/stories/${id}/vote`);
};

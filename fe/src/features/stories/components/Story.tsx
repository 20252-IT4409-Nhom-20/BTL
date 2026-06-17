import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { timeFormatter } from '@/lib/timeFormatter';
import type { hnItem } from '@/types/hnItem';
import { voteStory } from '../api/vote';

interface StoryProps {
  item: hnItem;
  rank: number;
}

export default function Story({ item, rank }: StoryProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: voteStory,
    onSuccess: () => {
      // Invalidate all stories queries
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
    onError: (error) => {
      console.error('Failed to vote:', error);
      alert('Failed to vote. Are you logged in?');
    },
  });

  const handleVote = (e: React.MouseEvent) => {
    e.preventDefault();
    mutation.mutate(item._id);
  };

  return (
    <>
      <tr>
        <td className="rank">{rank}.</td>
        <td className="title">
          <button onClick={handleVote} style={{ marginRight: '5px' }}>^</button>
          {item.url ? (
            <a href={item.url} target="_blank">
              {item.title}
            </a>
          ) : (
            <Link to={`/item/${item._id}`}>{item.title} (URL not provided)</Link>
          )}
        </td>
      </tr>

      <tr>
        <td />
        <td className="supplement-text">
          {item.score} points by {item.by} &nbsp;
          {timeFormatter(item.time)} &nbsp; | &nbsp;
          <Link to={`/item/${item._id}`}>{item.descendants ?? 0} comments</Link>
        </td>
      </tr>
    </>
  );
}

import { useItem } from '@/features/hn/api/getItem';
import { timeFormatter } from '@/lib/timeFormatter';
import type { hnItem } from '@/features/hn/types/hnitem';

interface StoryProps {
  id: number;
  rank: number;
}

export default function Story({ id, rank }: StoryProps) {
  const { data: story, isLoading, error } = useItem(id);

  if (isLoading) {
    return <tr>Loading...</tr>;
  }
  if (error || !story) return null;

  const item = story as hnItem;
  return (
    <>
      <tr>
        <td className="rank">{rank}.</td>
        <td className="title">
          {item.url ? (
            <a href={item.url} target="_blank">
              {item.title}
            </a>
          ) : (
            <a href={`/item/${item.id}`}>{item.title} (URL not provided)</a>
          )}
        </td>
      </tr>

      <tr>
        <td />
        <td className="supplement-text">
          {item.score} points by {item.by} &nbsp;
          {timeFormatter(item.time)} &nbsp; |&nbsp;
          <a href={`/item/${item.id}`}>{item.descendants ?? 0} comments</a>
        </td>
      </tr>
    </>
  );
}

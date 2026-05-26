import { Link } from 'react-router-dom';
import { timeFormatter } from '@/lib/timeFormatter';
import type { hnItem } from '@/types/hnItem';

interface StoryProps {
  item: hnItem;
  rank: number;
}

export default function Story({ item, rank }: StoryProps) {
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
            <Link to={`/item/${item.id}`}>{item.title} (URL not provided)</Link>
          )}
        </td>
      </tr>

      <tr>
        <td />
        <td className="supplement-text">
          {item.score} points by {item.by} &nbsp;
          {timeFormatter(item.time)} &nbsp; | &nbsp;
          <Link to={`/item/${item.id}`}>{item.descendants ?? 0} comments</Link>
        </td>
      </tr>
    </>
  );
}

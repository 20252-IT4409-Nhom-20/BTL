import { useParams } from 'react-router-dom';
import { useStories } from '@/features/stories/api/getStories';
import Story from '@/features/stories/components/Story';

const pathToType = {
  news: 'top',
  new: 'new',
  ask: 'ask',
  show: 'show',
  jobs: 'job',
} as const;

type PathKey = keyof typeof pathToType;

export default function News() {
  const { type } = useParams<{ type: string }>();
  const storyType = pathToType[(type as PathKey) ?? 'news'] ?? 'news';
  const { data: ids, isLoading, error } = useStories(storyType);

  if (isLoading) {
    return <tr>Loading...</tr>;
  }
  if (error) return <div>Error: {error?.message}</div>;
  return (
    <table>
      <tbody>
        {ids?.slice(0, 30).map((id: number, index: number) => (
          <Story key={id} id={id} rank={index + 1} />
        ))}
      </tbody>
    </table>
  );
}

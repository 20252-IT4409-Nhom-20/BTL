import { useParams } from 'react-router-dom';
import { useStories, type StoryType } from '@/features/stories/api/getStories';
import Story from '@/features/stories/components/Story';

const pathToType: Record<string, StoryType> = {
  news: 'top',
  new: 'new',
  ask: 'ask',
  show: 'show',
  jobs: 'job',
};

export default function News() {
  const { type } = useParams<{ type: string }>();
  const storyType = pathToType[type ?? 'news'] ?? 'top';
  const { data, isLoading, error } = useStories(storyType);

  if (isLoading) {
    return <tr>Loading...</tr>;
  }
  if (error) return <div>Error: {error?.message}</div>;
  return (
    <table>
      <tbody>
        {data?.items.map((item, index) => (
          <Story key={item.id} item={item} rank={index + 1} />
        ))}
      </tbody>
    </table>
  );
}

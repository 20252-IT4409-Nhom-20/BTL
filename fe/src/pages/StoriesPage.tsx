import { useParams, useSearchParams } from 'react-router-dom';
import { useStoriesItems } from '@/features/stories/api/getItems';

const pathToType = {
  news: 'top',
  new: 'new',
  ask: 'ask',
  show: 'show',
  jobs: 'job',
} as const;

type PathKey = keyof typeof pathToType;

export default function StoriesPage() {
  const { type } = useParams<{ type: string }>();
  const [searchParams] = useSearchParams();

  const storyType = pathToType[(type as PathKey) ?? 'news'] ?? 'top';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.max(1, parseInt(searchParams.get('limit') || '30', 10));

  const { data: items, isLoading, error } = useStoriesItems(storyType, page, limit);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) return <div>Error: {error?.message}</div>;

  return (
    <div>
      <div>DEBUG: Fetched {items?.length ?? 0} items (page={page}, limit={limit})</div>
      <table>
        <tbody>
          {/* Items here */}
        </tbody>
      </table>
    </div>
  );
}

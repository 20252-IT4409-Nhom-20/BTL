import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useStoriesItems } from '@/features/stories/api/getItems';
import Story from '@/features/stories/components/Story';

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
  const navigate = useNavigate();

  const storyType = pathToType[(type as PathKey) ?? 'news'] ?? 'top';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.max(1, parseInt(searchParams.get('limit') || '30', 10));

  const { data: items, isLoading, error } = useStoriesItems(storyType, page, limit);

  const handlePrevious = () => {
    const newPage = Math.max(1, page - 1);
    navigate(`/${type}?page=${newPage}&limit=${limit}`);
  };

  const handleNext = () => {
    const newPage = page + 1;
    navigate(`/${type}?page=${newPage}&limit=${limit}`);
  };

  const canGoPrevious = page > 1;
  const canGoNext = items && items.length > 0;

  const handleLimitChange = (newLimit: number) => {
    navigate(`/${type}?page=1&limit=${newLimit}`);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) return <div>Error: {error?.message}</div>;

  return (
    <div>
      <div>DEBUG: Fetched {items?.length ?? 0} items (page={page}, limit={limit})</div>

      <div>
        <button onClick={handlePrevious} disabled={!canGoPrevious}>
          Previous Page
        </button>
        <span style={{ margin: '0 1rem' }}>Page {page}</span>
        <button onClick={handleNext} disabled={!canGoNext}>
          Next Page
        </button>
      </div>

      <div>
        <label htmlFor="limit-select" style={{ marginRight: '0.5rem' }}>
          Items per page:
        </label>
        <select
          id="limit-select"
          value={limit}
          onChange={(e) => handleLimitChange(Number(e.target.value))}
        >
          <option value={30}>30</option>
          <option value={40}>40</option>
          <option value={50}>50</option>
        </select>
      </div>

      <table>
        <tbody>
          {items?.map((item, index) => (
            <Story key={item.id} item={item} rank={index + 1} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

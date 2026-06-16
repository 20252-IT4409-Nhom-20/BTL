import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useStoriesItems, type StoryType } from '@/features/stories/api/getItems';
import Story from '@/features/stories/components/Story';

const pathToType: Record<string, StoryType> = {
  news: 'top',
  new: 'new',
  ask: 'ask',
  show: 'show',
  jobs: 'job',
};

export default function StoriesPage() {
  const { type } = useParams<{ type: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const storyType = pathToType[type ?? 'news'] ?? 'top';
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

      <table>
        <tbody>
          {items?.map((item, index) => (
            <Story key={item._id} item={item} rank={(page - 1) * limit + (index + 1)} />
          ))}
        </tbody>
      </table>

      {items?.length === 0 && <p style={{ textAlign: 'center' }}>You have reached the end.</p>}

      <div style={{ textAlign: 'center' }}>
        <button onClick={handlePrevious} disabled={!canGoPrevious}>
          Previous Page
        </button>
        <span style={{ margin: '0 1rem' }}>Page {page}</span>
        <button onClick={handleNext} disabled={!canGoNext}>
          Next Page
        </button>
      </div>

      <div style={{ textAlign: 'center' }}>
        <label htmlFor="limit-select" style={{ marginRight: '0.5rem' }}>
          Items per page:
        </label>
        <select
          id="limit-select"
          value={limit}
          onChange={(e) => handleLimitChange(Number(e.target.value))}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={30}>30</option>
          <option value={40}>40</option>
          <option value={50}>50</option>
        </select>
      </div>

    </div>
  );
}

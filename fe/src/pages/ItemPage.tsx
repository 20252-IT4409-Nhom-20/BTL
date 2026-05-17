import { useParams } from 'react-router-dom';
import { useItem } from '@/features/stories/api/getItem';
import { timeFormatter } from '@/lib/timeFormatter';
import Comment from '@/features/stories/components/Comment';

export default function ItemPage() {
  const { id } = useParams<{ id: string }>();
  const parsedId = Number(id);
  const itemId = Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;
  const { data: item, isLoading, error } = useItem(itemId);

  if (!itemId) {
    return <p className="status error">Invalid item id.</p>;
  }

  if (isLoading) {
    return <p className="status">Loading item...</p>;
  }

  if (error) {
    return <p className="status error">Error: {error.message}</p>;
  }

  if (!item || item.length === 0) {
    return <p className="status">Item not found.</p>;
  }

  const [story, ...commentIds] = item;

  return (
    <section className="item-page">
      <h1 className="item-title">{story.title ?? `Item #${story.id}`}</h1>
      <p className="item-meta">
        {story.score ?? 0} points by {story.by ?? 'unknown'} · {timeFormatter(story.time)}
      </p>
      {story.text && (
        <div
          className="item-text text-wrap"
          dangerouslySetInnerHTML={{ __html: story.text }}
        />
      )}

      <h2>Comments</h2>
      {/* {kids.length === 0 ? ( */}
      {/*   <p className="status">No comments</p> */}
      {/* ) : ( */}
      {/*   <table className="kids-table"> */}
      {/*     <tbody> */}
      {/*       {kids.map((commentId) => ( */}
      {/*         <Comment key={commentId} id={commentId} depth={0} /> */}
      {/*       ))} */}
      {/*     </tbody> */}
      {/*   </table> */}
      {/* )} */}
    </section>
  );
}

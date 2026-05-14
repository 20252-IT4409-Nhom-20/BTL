import type { CSSProperties } from 'react';
import { useParams } from 'react-router-dom';
import { useItem } from '@/features/stories/api/getItem';
import { timeFormatter } from '@/lib/timeFormatter';

interface CommentRowsProps {
  ids: number[];
  depth?: number;
}

function CommentRows({ ids, depth = 0 }: CommentRowsProps) {
  return (
    <>
      {ids.map((id) => (
        <CommentRow key={id} id={id} depth={depth} />
      ))}
    </>
  );
}

interface CommentRowProps {
  id: number;
  depth: number;
}

function CommentRow({ id, depth }: CommentRowProps) {
  const { data: comment, isLoading, error } = useItem(id);
  const depthStyle = { '--comment-indent': `${depth * 40}px` } as CSSProperties;

  if (isLoading) {
    return (
      <tr className="comment-row">
        <td className="comment-cell">
          <article className="hn-comment status" style={depthStyle}>
            Loading comment...
          </article>
        </td>
      </tr>
    );
  }

  if (error) {
    return (
      <tr className="comment-row">
        <td className="comment-cell">
          <article className="hn-comment status error" style={depthStyle}>
            Error loading comment #{id}: {error.message}
          </article>
        </td>
      </tr>
    );
  }

  if (!comment || comment.dead) {
    return null;
  }

  const replies = Array.isArray(comment.kids) ? comment.kids : [];

  return (
    <>
      <tr className="comment-row" style={depthStyle}>
        <td className="comment-cell">
          <article className="hn-comment" style={depthStyle}>
            <div className="comment-meta">
              <span className="votearrow">▲</span>{' '}
              <a href={`/item/${comment.id}`}>{comment.by ?? 'unknown'}</a>{' '}
              {timeFormatter(comment.time)} | parent | next [–]
            </div>
            <div
              className="comment-body text-wrap"
              dangerouslySetInnerHTML={{ __html: comment.text ?? '[deleted]' }}
            />
            <div className="comment-actions">
              <a href={`/item/${comment.id}`}>reply</a>
            </div>
          </article>
        </td>
      </tr>
      {replies.length > 0 && <CommentRows ids={replies} depth={depth + 1} />}
    </>
  );
}

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

  if (!item) {
    return <p className="status">Item not found.</p>;
  }

  const kids = Array.isArray(item.kids) ? item.kids : [];

  return (
    <section className="item-page">
      <h1 className="item-title">{item.title ?? `Item #${item.id}`}</h1>
      <p className="item-meta">
        {item.score ?? 0} points by {item.by ?? 'unknown'} · {timeFormatter(item.time)}
      </p>
      {item.text && (
        <div
          className="item-text text-wrap"
          dangerouslySetInnerHTML={{ __html: item.text }}
        />
      )}

      <h2>Comments</h2>
      {kids.length === 0 ? (
        <p className="status">No comments</p>
      ) : (
        <table className="kids-table">
          <tbody>
            <CommentRows ids={kids} />
          </tbody>
        </table>
      )}
    </section>
  );
}

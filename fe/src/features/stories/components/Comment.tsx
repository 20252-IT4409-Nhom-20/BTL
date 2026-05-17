import type { CSSProperties } from 'react';
import { useItem } from '@/features/stories/api/getItem';
import { timeFormatter } from '@/lib/timeFormatter';

interface CommentProps {
  id: number;
  depth: number;
}

export default function Comment({ id, depth }: CommentProps) {
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
      {replies.map((kidId) => (
        <Comment key={kidId} id={kidId} depth={depth + 1} />
      ))}
    </>
  );
}

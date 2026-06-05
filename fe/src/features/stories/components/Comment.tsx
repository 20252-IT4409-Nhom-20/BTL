import type { CSSProperties } from 'react';
import { timeFormatter } from '@/lib/timeFormatter';
import type { hnItem } from '@/types/hnItem';
import DOMPurify from 'dompurify';

interface CommentProps {
  comment: hnItem;
  depth: number;
}

export default function Comment({ comment, depth }: CommentProps) {
  const depthStyle = { '--comment-indent': `${depth * 40}px` } as CSSProperties;

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
              <a href={`/item/${comment.id || comment._id}`}>{comment.by ?? 'unknown'}</a>{' '}
              {timeFormatter(comment.time)} | parent | next [–]
            </div>
            <div
              className="comment-body text-wrap"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(comment.text ?? '[deleted]') }}
            />
            <div className="comment-actions">
              <a href={`/item/${comment.id || comment._id}`}>reply</a>
            </div>
          </article>
        </td>
      </tr>
      {replies.map((kid) => (
        <Comment key={kid.id || kid._id} comment={kid} depth={depth + 1} />
      ))}
    </>
  );
}

import { useState, type CSSProperties } from 'react';
import { timeFormatter } from '@/lib/timeFormatter';
import type { hnItem } from '@/types/hnItem';
import DOMPurify from 'dompurify';
import { useAuth } from '@/features/auth/useAuth';
import CommentForm from './CommentForm';
import { deleteStory } from '@/features/stories/api/deleteStory';

interface CommentProps {
  comment: hnItem;
  depth: number;
  rootId: string | number;
}

export default function Comment({ comment, depth, rootId }: CommentProps) {
  const [isReplying, setIsReplying] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const depthStyle = { '--comment-indent': `${depth * 40}px` } as CSSProperties;

  const isOwner = user?.username === comment.by;

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteStory(String(comment._id || comment.id));
        window.location.reload();
      } catch (err) {
        alert('Failed to delete.');
      }
    }
  };

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
              {timeFormatter(comment.time)} |{' '}
              {isOwner && (
                <button
                  type="button"
                  onClick={handleDelete}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 'inherit', color: 'inherit' }}
                >
                  delete
                </button>
              )}
            </div>
            <div
              className="comment-body text-wrap"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(comment.text ?? '[deleted]') }}
            />
            {isAuthenticated && (
              <div className="comment-actions">
                <button
                  type="button"
                  onClick={() => setIsReplying(!isReplying)}
                >
                  {isReplying ? 'cancel' : 'reply'}
                </button>
              </div>
            )}
          </article>
        </td>
      </tr>
      {isReplying && (
        <tr style={depthStyle}>
          <td className="comment-cell">
            <CommentForm
              parentId={comment._id || comment.id}
              rootId={rootId}
              onSuccess={() => setIsReplying(false)}
            />
          </td>
        </tr>
      )}
      {replies.map((kid) => (
        <Comment key={kid.id || kid._id} comment={kid} depth={depth + 1} rootId={rootId} />
      ))}
    </>
  );
}

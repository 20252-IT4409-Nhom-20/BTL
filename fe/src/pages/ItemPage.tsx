import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useItem } from '@/features/stories/api/getItem';
import { useDeleteStory } from '@/features/stories/api/deleteStory';
import { useAuth } from '@/features/auth/useAuth';
import { timeFormatter } from '@/lib/timeFormatter';
import Comment from '@/features/stories/components/Comment';
import CommentForm from '@/features/stories/components/CommentForm';

export default function ItemPage() {
  const { id } = useParams<{ id: string }>();
  const itemId = id || null;
  const navigate = useNavigate();
  const { data: item, isLoading, error } = useItem(itemId as any);
  const { user, isAuthenticated } = useAuth();
  const deleteStoryMutation = useDeleteStory();

  const handleDelete = async () => {
    if (!itemId || !confirm('Are you sure you want to delete this story?')) return;
    try {
      await deleteStoryMutation.mutateAsync(itemId);
      navigate('/');
    } catch (err) {
      console.error('Failed to delete story', err);
      alert('Failed to delete story');
    }
  };

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

  const [story, ...comments] = item;
  const rootId = story._id || story.id;
  
  const canDelete = isAuthenticated && user && (user.username === story.by || user.role === 'admin');

  return (
    <section className="item-page">
      <div className="item-header">
        <h1 className="item-title">
          {story.url ? (
            <>
              <a href={story.url} target="_blank" rel="noreferrer" className="story-link">
                {story.title ?? `Item #${story.id || story._id}`}
              </a>
              <span className="item-url">
                {' '}({new URL(story.url).hostname})
              </span>
            </>
          ) : (
            story.title ?? `Item #${story.id || story._id}`
          )}
        </h1>
        <p className="item-meta">
          {story.score ?? 0} points by {story.by ?? 'unknown'} · {timeFormatter(story.time)}
          {canDelete && (
             <span>
               {' | '}
               <button 
                 onClick={handleDelete} 
                 disabled={deleteStoryMutation.isPending}
                 style={{ color: 'red', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
               >
                 {deleteStoryMutation.isPending ? 'Deleting...' : 'delete'}
               </button>
             </span>
          )}
        </p>
      </div>

      {story.text && (
        <div
          className="item-text text-wrap"
          dangerouslySetInnerHTML={{ __html: story.text }}
        />
      )}

      {isAuthenticated ? (
        <CommentForm parentId={rootId} rootId={rootId} />
      ) : (
        <p className="login-prompt">Please log in to add a comment.</p>
      )}

      <h2 className="comments-heading">Comments</h2>
      {comments.length === 0 ? (
        <p className="status">No comments yet</p>
      ) : (
        <table className="kids-table">
          <tbody>
            {comments.map((commentObj) => (
              <Comment key={commentObj.id || commentObj._id} comment={commentObj} depth={0} rootId={rootId} />
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

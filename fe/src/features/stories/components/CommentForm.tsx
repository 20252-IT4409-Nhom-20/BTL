import { useState } from 'react';
import { useCreateComment } from '@/features/stories/api/createComment';

interface CommentFormProps {
  parentId: string | number;
  rootId: string | number;
  onSuccess?: () => void;
}

export default function CommentForm({ parentId, rootId, onSuccess }: CommentFormProps) {
  const [commentText, setCommentText] = useState('');
  const createCommentMutation = useCreateComment();

  const handleSubmitComment = async (formData: FormData) => {
    const text = formData.get('commentText') as string;
    if (!text?.trim()) return;

    try {
      await createCommentMutation.mutateAsync({
        text,
        parent_id: parentId,
        root_id: rootId,
      });
      setCommentText('');
      onSuccess?.();
    } catch (err) {
      console.error('Failed to post comment', err);
    }
  };

  return (
    <div className="comment-form-container">
      <form action={handleSubmitComment} className="comment-form">
        <textarea
          name="commentText"
          rows={6}
          cols={80}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add your comment..."
        />
        <div className="form-actions">
          <button 
            type="submit" 
            disabled={createCommentMutation.isPending || !commentText.trim()}
          >
            {createCommentMutation.isPending ? 'Adding...' : 'add comment'}
          </button>
        </div>
      </form>
    </div>
  );
}

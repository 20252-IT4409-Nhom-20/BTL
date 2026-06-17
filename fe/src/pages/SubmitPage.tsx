import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubmitStory } from '@/features/stories/api/submitStory';

export default function SubmitPage() {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const navigate = useNavigate();
  const submitStoryMutation = useSubmitStory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await submitStoryMutation.mutateAsync({
        title,
        url: url.trim() || undefined,
        text: text.trim() || undefined,
        type: 'story',
      });
      navigate('/news');
    } catch (err) {
      console.error('Failed to submit story', err);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Submit Story</h1>
      <form onSubmit={handleSubmit} className="comment-form">
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block' }}>Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
            required
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block' }}>URL:</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block' }}>Text (optional):</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <button
          type="submit"
          disabled={submitStoryMutation.isPending || !title.trim()}
          style={{ padding: '10px 20px' }}
        >
          {submitStoryMutation.isPending ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}

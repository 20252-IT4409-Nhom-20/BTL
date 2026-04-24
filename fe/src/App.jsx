import './App.css'
import { useEffect, useState } from 'react'

const API_BASE = 'https://hacker-news.firebaseio.com/v0'

function formatRelativeTime(unixTime) {
  if (!unixTime) {
    return 'unknown time'
  }

  const deltaSeconds = Math.max(1, Math.floor(Date.now() / 1000) - unixTime)
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
    ['second', 1],
  ]

  for (const [unit, seconds] of units) {
    const value = Math.floor(deltaSeconds / seconds)
    if (value >= 1) {
      return `${value} ${unit}${value > 1 ? 's' : ''} ago`
    }
  }

  return 'just now'
}

function fetchItem(id, signal) {
  return fetch(`${API_BASE}/item/${id}.json`, { signal }).then((res) => {
    if (!res.ok) {
      throw new Error('Cannot fetch Hacker News item')
    }
    return res.json()
  })
}

async function fetchCommentTree(commentIds = [], signal) {
  const comments = await Promise.all(
    commentIds.map(async (id) => {
      const comment = await fetchItem(id, signal)

      if (!comment || comment.deleted || comment.dead) {
        return null
      }

      const children = await fetchCommentTree(comment.kids ?? [], signal)

      return {
        ...comment,
        children,
      }
    }),
  )

  return comments.filter(Boolean)
}

function CommentNode({ comment, depth = 0 }) {
  return (
    <li className="comment-item" style={{ '--depth': depth }}>
      <div className="comment-meta">
        <span className="author">{comment.by ?? 'unknown'}</span>
        <span className="dot">•</span>
        <span>{formatRelativeTime(comment.time)}</span>
      </div>
      <div
        className="comment-text"
        dangerouslySetInnerHTML={{ __html: comment.text ?? '' }}
      />

      {comment.children.length > 0 && (
        <ul className="comment-children">
          {comment.children.map((child) => (
            <CommentNode key={child.id} comment={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  )
}

function App() {
  const getIdFromQuery = () => {
    const idFromQuery = new URLSearchParams(window.location.search).get('id')
    const parsed = Number(idFromQuery)
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null
  }

  // compute id from URL each render; listen to popstate to update when user navigates
  const [itemId, setItemId] = useState(() => getIdFromQuery())
  const [inputId, setInputId] = useState(() => {
    const id = getIdFromQuery()
    return id ? String(id) : ''
  })
  const [story, setStory] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // update itemId if the user navigates browser history (back/forward) or manually changes URL
    function handlePop() {
      const id = getIdFromQuery()
      setItemId(id)
      setInputId(id ? String(id) : '')
    }

    window.addEventListener('popstate', handlePop)
    window.addEventListener('hashchange', handlePop)
    const controller = new AbortController()

    async function loadItem() {
      try {
        setLoading(true)
        setError('')

        const item = await fetchItem(itemId, controller.signal)
        if (!item) {
          throw new Error(`Item #${itemId} not found`)
        }

        const commentTree = await fetchCommentTree(item.kids ?? [], controller.signal)

        setStory(item)
        setComments(commentTree)
      } catch (err) {
        if (err.name === 'AbortError') {
          return
        }

        setStory(null)
        setComments([])
        setError(err.message || 'Failed to load item')
      } finally {
        setLoading(false)
      }
    }

    loadItem()

    return () => {
      controller.abort()
      window.removeEventListener('popstate', handlePop)
      window.removeEventListener('hashchange', handlePop)
    }
  }, [itemId])

  function handleSubmit(event) {
    event.preventDefault()
    const parsed = Number(inputId)
    if (!Number.isInteger(parsed) || parsed <= 0) {
      setError('Please enter a valid numeric item id.')
      return
    }
    // update state and sync URL so direct links work
    setItemId(parsed)
    setInputId(String(parsed))
    try {
      const url = new URL(window.location.href)
      url.searchParams.set('id', String(parsed))
      window.history.replaceState(null, '', url.toString())
    } catch (e) {
      // ignore URL update failures (e.g., non-browser env)
    }
  }

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">Huster News</div>
        <form className="item-form" onSubmit={handleSubmit}>
          <label htmlFor="item-id">Item ID</label>
          <input
            id="item-id"
            value={inputId}
            onChange={(event) => setInputId(event.target.value)}
            inputMode="numeric"
            placeholder="Search anything..."
          />
          <button type="submit">Load</button>
        </form>
      </header>

      <main className="content">
        {loading && <p className="status">Loading item #{itemId}...</p>}
        {!loading && error && <p className="status error">{error}</p>}

        {!loading && !error && story && (
          <>
            <article className="story-card">
              <p className="story-line">
                <span className="score">{story.score ?? 0} points</span>
                <span className="dot">•</span>
                <span>by {story.by ?? 'unknown'}</span>
                <span className="dot">•</span>
                <span>{formatRelativeTime(story.time)}</span>
              </p>

              <h1>{story.title ?? `Item #${story.id}`}</h1>

              <p className="story-links">
                {story.url && (
                  <a href={story.url} target="_blank" rel="noreferrer">
                    Open original link
                  </a>
                )}
                <a
                  href={`https://news.ycombinator.com/item?id=${story.id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View on Hacker News
                </a>
              </p>

              {story.text && (
                <div
                  className="story-text"
                  dangerouslySetInnerHTML={{ __html: story.text }}
                />
              )}
            </article>

            <section className="comments-card">
              <h2>Comments ({story.descendants ?? comments.length})</h2>
              {comments.length === 0 ? (
                <p className="status">No comments found.</p>
              ) : (
                <ul className="comment-list">
                  {comments.map((comment) => (
                    <CommentNode key={comment.id} comment={comment} />
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  )
}

export default App

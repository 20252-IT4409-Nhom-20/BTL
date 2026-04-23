import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { timeAgo } from '../utils/timeAgo'

function Comment({ comment, index, total }) {
  const [collapsed, setCollapsed] = useState(false)

  if (!comment || comment.deleted || comment.dead) return null

  return (
    <div className="hn-comment">
      <div className="hn-comment-head">
        <span
          className="hn-comment-toggle"
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? 'expand' : 'collapse'}
        >
          [{collapsed ? '+' : '-'}]
        </span>{' '}
        <a className="hn-comment-author" href={`/user?id=${comment.by}`}>
          {comment.by}
        </a>{' '}
        <span className="hn-comment-age">{timeAgo(comment.time)}</span>
        {' | '}
        {index > 0 && <span className="hn-comment-nav">prev | </span>}
        {index < total - 1 && <span className="hn-comment-nav">next | </span>}
        <Link to={`/item?id=${comment.id}`} className="hn-comment-nav">
          link
        </Link>
      </div>

      {!collapsed && (
        <>
          <div
            className="hn-comment-text"
            dangerouslySetInnerHTML={{ __html: comment.text || '' }}
          />
          <div className="hn-comment-reply">
            <Link to={`/item?id=${comment.id}`}>reply</Link>
          </div>
          {comment.kids && comment.kids.length > 0 && (
            <div className="hn-comment-children">
              <CommentList ids={comment.kids} />
            </div>
          )}
        </>
      )}
    </div>
  )
}

function CommentList({ ids }) {
  const [{ comments, fetchedIds }, setResult] = useState({
    comments: [],
    fetchedIds: null,
  })

  const loading = !!(ids && ids.length > 0 && fetchedIds !== ids)

  useEffect(() => {
    if (!ids || ids.length === 0) return
    let cancelled = false
    const limit = ids.slice(0, 20)
    Promise.all(
      limit.map((id) =>
        fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(
          (r) => r.json(),
        ),
      ),
    )
      .then((results) => {
        if (!cancelled)
          setResult({ comments: results.filter(Boolean), fetchedIds: ids })
      })
      .catch(() => {
        if (!cancelled) setResult({ comments: [], fetchedIds: ids })
      })
    return () => {
      cancelled = true
    }
  }, [ids])

  if (loading) return <div className="hn-comment-loading">loading...</div>

  return (
    <>
      {comments.map((c, i) => (
        <Comment key={c.id} comment={c} index={i} total={comments.length} />
      ))}
    </>
  )
}

export { Comment, CommentList }

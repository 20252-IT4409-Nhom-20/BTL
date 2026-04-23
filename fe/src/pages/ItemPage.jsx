import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import NavBar from '../components/NavBar'
import { CommentList } from '../components/Comment'
import { timeAgo } from '../utils/timeAgo'

function domain(url) {
  if (!url) return null
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

export default function ItemPage() {
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id')

  const [{ item, fetchedId }, setFetchResult] = useState({
    item: null,
    fetchedId: null,
  })
  const [commentText, setCommentText] = useState('')

  const loading = !!id && fetchedId !== id

  useEffect(() => {
    if (!id) return
    let cancelled = false
    fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setFetchResult({ item: data, fetchedId: id })
      })
      .catch(() => {
        if (!cancelled) setFetchResult({ item: null, fetchedId: id })
      })
    return () => {
      cancelled = true
    }
  }, [id])

  return (
    <div id="hn-container">
      <NavBar />
      <main id="hn-main">
        {loading && (
          <table className="hn-content-table">
            <tbody>
              <tr>
                <td className="hn-padded">Loading...</td>
              </tr>
            </tbody>
          </table>
        )}

        {!loading && !item && (
          <table className="hn-content-table">
            <tbody>
              <tr>
                <td className="hn-padded">Item not found.</td>
              </tr>
            </tbody>
          </table>
        )}

        {!loading && item && (
          <table className="hn-content-table">
            <tbody>
              {/* Story header */}
              <tr className="hn-spacer-row" />
              <tr>
                <td>
                  <table className="hn-item-table">
                    <tbody>
                      <tr className="hn-item-row">
                        <td className="hn-vote-cell">
                          <div className="hn-vote-arrow" title="upvote">
                            ▲
                          </div>
                        </td>
                        <td className="hn-title-cell">
                          {item.url ? (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noreferrer"
                              className="hn-story-title"
                            >
                              {item.title}
                            </a>
                          ) : (
                            <span className="hn-story-title">{item.title}</span>
                          )}
                          {item.url && (
                            <span className="hn-domain">
                              {' '}
                              ({domain(item.url)})
                            </span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td />
                        <td className="hn-subtext-cell">
                          <span className="hn-subtext">
                            {item.score} point{item.score !== 1 ? 's' : ''} by{' '}
                            <a
                              href={`/user?id=${item.by}`}
                              className="hn-user"
                            >
                              {item.by}
                            </a>{' '}
                            <span title={new Date(item.time * 1000).toISOString()}>
                              {timeAgo(item.time)}
                            </span>{' '}
                            |{' '}
                            <a href={`/hide?id=${item.id}`}>hide</a> |{' '}
                            <a href={`/past?id=${item.id}`}>past</a> |{' '}
                            <a href={`/favorite?id=${item.id}`}>favorite</a> |{' '}
                            <Link to={`/item?id=${item.id}`}>
                              {item.descendants != null
                                ? `${item.descendants} comment${item.descendants !== 1 ? 's' : ''}`
                                : 'discuss'}
                            </Link>
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* Story text (for Ask HN, etc.) */}
              {item.text && (
                <tr>
                  <td className="hn-padded">
                    <div
                      className="hn-item-text"
                      dangerouslySetInnerHTML={{ __html: item.text }}
                    />
                  </td>
                </tr>
              )}

              {/* Comment form */}
              <tr>
                <td className="hn-padded">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      setCommentText('')
                    }}
                  >
                    <input type="hidden" name="parent" value={item.id} />
                    <textarea
                      name="text"
                      rows={6}
                      cols={60}
                      className="hn-comment-textarea"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                    />
                    <div className="hn-comment-form-footer">
                      <span className="hn-comment-help">
                        <a href="/formatdoc">help</a>
                      </span>
                    </div>
                    <br />
                    <button type="submit" className="hn-submit-btn">
                      add comment
                    </button>
                  </form>
                </td>
              </tr>

              <tr className="hn-spacer-row" />

              {/* Comments */}
              {item.kids && item.kids.length > 0 && (
                <tr>
                  <td className="hn-comments-cell">
                    <CommentList ids={item.kids} />
                  </td>
                </tr>
              )}

              <tr className="hn-spacer-row" />
            </tbody>
          </table>
        )}
      </main>

      <footer id="hn-footer">
        <div className="hn-footer-divider" />
        <span className="hn-yclinks">
          <a href="/faq">FAQ</a> | <a href="/lists">Lists</a> |{' '}
          <a href="/legal">Legal</a> | <a href="/apply">Apply to HUST</a> |{' '}
          <a href="mailto:email@example.com">Contact</a>
        </span>
        <form method="get" action="https://hn.algolia.com/">
          Search:{' '}
          <input type="text" name="q" size={17} className="hn-search-input" />
        </form>
      </footer>
    </div>
  )
}

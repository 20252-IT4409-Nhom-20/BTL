import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import NavBar from '../components/NavBar'
import { timeAgo } from '../utils/timeAgo'

const TOP_STORIES_URL =
  'https://hacker-news.firebaseio.com/v0/topstories.json'
const ITEM_URL = (id) =>
  `https://hacker-news.firebaseio.com/v0/item/${id}.json`

function domain(url) {
  if (!url) return null
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

function StoryRow({ story, rank }) {
  if (!story) return null
  return (
    <>
      <tr className="hn-story-row">
        <td className="hn-rank-cell">{rank}.</td>
        <td className="hn-vote-cell">
          <div className="hn-vote-arrow" title="upvote">
            ▲
          </div>
        </td>
        <td className="hn-title-cell">
          {story.url ? (
            <a
              href={story.url}
              target="_blank"
              rel="noreferrer"
              className="hn-story-title"
            >
              {story.title}
            </a>
          ) : (
            <Link to={`/item?id=${story.id}`} className="hn-story-title">
              {story.title}
            </Link>
          )}
          {story.url && (
            <span className="hn-domain"> ({domain(story.url)})</span>
          )}
        </td>
      </tr>
      <tr>
        <td colSpan={2} />
        <td className="hn-subtext-cell">
          <span className="hn-subtext">
            {story.score} point{story.score !== 1 ? 's' : ''} by{' '}
            <a href={`/user?id=${story.by}`} className="hn-user">
              {story.by}
            </a>{' '}
            <span title={new Date(story.time * 1000).toISOString()}>
              {timeAgo(story.time)}
            </span>{' '}
            |{' '}
            <Link to={`/item?id=${story.id}`}>
              {story.descendants != null
                ? `${story.descendants} comment${story.descendants !== 1 ? 's' : ''}`
                : 'discuss'}
            </Link>
          </span>
        </td>
      </tr>
      <tr className="hn-story-spacer" />
    </>
  )
}

export default function NewsPage() {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(TOP_STORIES_URL)
      .then((r) => r.json())
      .then((ids) => {
        const top30 = ids.slice(0, 30)
        return Promise.all(top30.map((id) => fetch(ITEM_URL(id)).then((r) => r.json())))
      })
      .then((items) => {
        setStories(items.filter(Boolean))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div id="hn-container">
      <NavBar />
      <main id="hn-main">
        <table className="hn-content-table">
          <tbody>
            <tr className="hn-spacer-row" />
            {loading ? (
              <tr>
                <td className="hn-padded">Loading...</td>
              </tr>
            ) : (
              stories.map((s, i) => (
                <StoryRow key={s.id} story={s} rank={i + 1} />
              ))
            )}
          </tbody>
        </table>
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

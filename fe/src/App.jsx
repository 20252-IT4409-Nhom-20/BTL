<<<<<<< HEAD
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/MainLayout';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/MainLayout';
import StoriesPage from '@/pages/StoriesPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ItemPage from '@/pages/ItemPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/item/:id" element={<ItemPage />} />
          <Route path="/:type" element={<StoriesPage />} />
          <Route path="/" element={<Navigate to="/news" replace />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
}
      </header>

      <main className="content">
        {itemId ? (
          <CommentPage
            item={item}
            loading={isItemLoading}
            error={itemError}
            onBack={handleBack}
          />
        ) : view === 'comments' ? (
          <section className="comment-feed-section">
            <h1>Comments</h1>
            <CommentFeed
              comments={comments}
              loading={isCommentsLoading}
              error={commentsError}
              onOpenItem={handleOpenComments}
            />
          </section>
        ) : (
          <section className="story-list">
            <h1>Top Stories</h1>
            {isStoriesLoading && <p className="status">Loading stories...</p>}
            {storiesError && (
              <p className="status error">Error: {storiesError.message}</p>
            )}
            {!isStoriesLoading && !storiesError && Array.isArray(stories) && (
              <ol className="story-items">
                {stories.map((story, index) => (
                  <li key={story.id} className="story-item">
                    <span className="story-rank">{index + 1}.</span>
                    <div>
                      <a
                        className="story-title"
                        href={story.url ?? `https://news.ycombinator.com/item?id=${story.id}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {story.title ?? `Item #${story.id}`}
                      </a>
                      <div className="story-meta">
                        {story.score ?? 0} points by {story.by ?? 'unknown'}
                        <span className="dot">•</span>
                        <a
                          href={`?id=${story.id}`}
                          onClick={(event) => handleOpenComments(story.id, event)}
                        >
                          {story.descendants ?? 0} comments
                        </a>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
>>>>>>> 24a49e8 (feat: update comment page)
        )}
      </main>
    </div>
  )
}

export default App
>>>>>>> 34499c0 (feat: update comment page)

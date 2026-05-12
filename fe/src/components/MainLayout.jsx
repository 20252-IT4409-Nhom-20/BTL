import { Outlet } from 'react-router-dom';
import { Navbar } from '@/features/nav/components/Navbar';

export const MainLayout = () => {
  return (
    <div id="container">

      <Navbar />

      <main id="news-root">
        <Outlet />
      </main>

      <footer>
        <div className="footer-divider"></div>
        <span className="yclinks">
          <a href="https://example.com">FAQ</a> | <a href="lists">Lists</a> |
          <a href="legal">Legal</a> | <a href="apply">Apply to HUST</a> |
          <a href="mailto:email@example.com">Contact</a>
        </span>
        <form method="get" action="https://hn.algolia.com/">
          Search: <input type="text" name="q" size="17" />
        </form>
      </footer>

    </div>
  );
};

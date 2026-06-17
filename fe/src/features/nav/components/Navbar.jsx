import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';
import './Navbar.css';

export const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initial = user?.username?.charAt(0)?.toUpperCase() ?? '?';

  return (
    <nav className="nav-container">
      <div className="nav-left">
        <Link to="/" className="logo-link">
          <img
            src="/icons.svg"
            width="18"
            height="18"
            className="logo-img"
            alt="logo"
          />
        </Link>
        <div className="pagetop">
          <b className="hnname">
            <Link to="/news">Huster News</Link>
          </b>
          <div className="nav-links">
            <NavLink to="/new">new</NavLink>
            <span className="divider">|</span>
            <NavLink to="/ask">ask</NavLink>
            <span className="divider">|</span>
            <NavLink to="/show">show</NavLink>
            <span className="divider">|</span>
            <NavLink to="/jobs">jobs</NavLink>
            <span className="divider">|</span>
            <NavLink to="/submit">submit</NavLink>
          </div>
        </div>
      </div>
      <div className="nav-right">
        <span className="pagetop nav-user">
          {isAuthenticated ? (
            <>
              <span
                className="nav-avatar"
                title={user?.username ?? ''}
                aria-label={`Logged in as ${user?.username ?? ''}`}
              >
                {initial}
              </span>
              <button
                type="button"
                className="nav-logout"
                onClick={handleLogout}
              >
                logout
              </button>
            </>
          ) : (
            <Link to="/login?goto=news">login</Link>
          )}
        </span>
      </div>
    </nav>
  );
};

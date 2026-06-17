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
    <nav>
      <table className="nav-table">
        <tbody>
          <tr>
            <td className="logo-cell">
              <Link to="/">
                <img
                  src="/icons.svg"
                  width="18"
                  height="18"
                  className="logo-img"
                  alt="logo"
                />
              </Link>
            </td>
            <td>
              <span className="pagetop">
                <b className="hnname">
                  <Link to="/news">Huster News</Link>
                </b>
                {' '}
                <NavLink to="/new">new</NavLink> |{' '}
                <NavLink to="/ask">ask</NavLink> |{' '}
                <NavLink to="/show">show</NavLink> |{' '}
                <NavLink to="/jobs">jobs</NavLink> |{' '}
                <NavLink to="/submit">submit</NavLink>
              </span>
            </td>
            <td style={{ textAlign: 'right', paddingRight: '4px' }}>
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
            </td>
          </tr>
        </tbody>
      </table>
    </nav>
  );
};

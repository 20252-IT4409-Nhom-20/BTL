import { NavLink, Link } from 'react-router-dom';
import './Navbar.css';

export const Navbar = () => {
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
                <NavLink to="/newest">new</NavLink> |{' '}
                <NavLink to="/front">past</NavLink> |{' '}
                <NavLink to="/newcomments">comments</NavLink> |{' '}
                <NavLink to="/ask">ask</NavLink> |{' '}
                <NavLink to="/show">show</NavLink> |{' '}
                <NavLink to="/jobs">jobs</NavLink> |{' '}
                <NavLink to="/submit">submit</NavLink>
              </span>
            </td>
            <td style={{ textAlign: 'right', paddingRight: '4px' }}>
              <span className="pagetop">
                <Link to="/login?goto=news">login</Link>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </nav>
  );
};


import { Link } from 'react-router-dom'

export default function NavBar() {
  return (
    <nav className="hn-nav">
      <table className="hn-nav-table">
        <tbody>
          <tr>
            <td className="hn-nav-logo">
              <Link to="/">
                <img
                  src="/favicon.svg"
                  width="18"
                  height="18"
                  className="hn-logo-img"
                  alt="Y"
                />
              </Link>
            </td>
            <td>
              <span className="hn-pagetop">
                <b className="hn-sitename">
                  <Link to="/">Huster News</Link>
                </b>
                <Link to="/">new</Link> |{' '}
                <Link to="/">past</Link> |{' '}
                <Link to="/">comments</Link> |{' '}
                <Link to="/">ask</Link> |{' '}
                <Link to="/">show</Link> |{' '}
                <Link to="/">jobs</Link> |{' '}
                <Link to="/">submit</Link>
              </span>
            </td>
            <td className="hn-nav-login">
              <span className="hn-pagetop">
                <Link to="/login">login</Link>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </nav>
  )
}

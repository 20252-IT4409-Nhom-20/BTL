import { useState } from 'react'
import OAuthButtons from './OAuthButtons.jsx'
import './auth.css'

function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!username.trim()) {
      setError('Username is required.')
      return
    }
    if (!password) {
      setError('Password is required.')
      return
    }

    setSuccess(`Welcome back, ${username}!`)
  }

  return (
    <div className="auth-page">
      <h1>Login</h1>
      <p className="auth-subtitle">Welcome back to Huster News</p>

      <OAuthButtons action="Login" />

      <div className="auth-divider-text">or</div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-row">
          <label htmlFor="login-username">Username</label>
          <input
            id="login-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoFocus
          />
        </div>
        <div className="auth-row">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}
        <button type="submit" className="auth-primary">
          Login
        </button>
      </form>

      <p className="auth-switch">
        Don't have an account? <a href="#register">Register</a>
      </p>
    </div>
  )
}

export default LoginPage

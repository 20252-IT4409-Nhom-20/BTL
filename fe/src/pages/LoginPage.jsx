import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OAuthButtons from './OAuthButtons.jsx'
import { login } from '@/features/auth/api'
import './auth.css'

function LoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
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

    setSubmitting(true)
    try {
      const data = await login({ username: username.trim(), password })
      setSuccess(`Welcome back, ${data.user.username}!`)
      setTimeout(() => navigate('/news'), 600)
    } catch (err) {
      const message = err?.response?.data?.message || 'Login failed.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
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
        <button type="submit" className="auth-primary" disabled={submitting}>
          {submitting ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p className="auth-switch">
        Don't have an account? <a href="/register">Register</a>
      </p>
    </div>
  )
}

export default LoginPage

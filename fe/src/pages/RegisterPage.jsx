import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OAuthButtons from './OAuthButtons.jsx'
import { register, login } from '@/features/auth/api'
import './auth.css'

function RegisterPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
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
    if (username.length < 3) {
      setError('Username must be at least 3 characters.')
      return
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Email is invalid.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      await register({ username: username.trim(), email: email.trim(), password })
      await login({ username: username.trim(), password })
      setSuccess(`Account "${username}" created!`)
      setTimeout(() => navigate('/news'), 600)
    } catch (err) {
      const message = err?.response?.data?.message || 'Registration failed.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <h1>Create Account</h1>
      <p className="auth-subtitle">Join the Huster News community</p>

      <OAuthButtons action="Sign up" />

      <div className="auth-divider-text">or</div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-row">
          <label htmlFor="reg-username">Username</label>
          <input
            id="reg-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoFocus
          />
        </div>
        <div className="auth-row">
          <label htmlFor="reg-email">Email</label>
          <input
            id="reg-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        <div className="auth-row">
          <label htmlFor="reg-password">Password</label>
          <input
            id="reg-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        <div className="auth-row">
          <label htmlFor="reg-confirm">Confirm password</label>
          <input
            id="reg-confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}
        <button type="submit" className="auth-primary" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create account'}
        </button>
      </form>

      <p className="auth-switch">
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  )
}

export default RegisterPage

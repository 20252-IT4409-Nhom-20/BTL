import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, register } from '@/features/auth/api'
import './auth.css'

function AuthPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // 'login' or 'register'
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

    if (mode === 'register') {
      if (username.length < 3) return setError('Username must be at least 3 chars.')
      if (!email.includes('@')) return setError('Invalid email.')
      if (password.length < 6) return setError('Password must be at least 6 chars.')
      if (password !== confirm) return setError('Passwords do not match.')

      setSubmitting(true)
      try {
        await register({ username, email, password })
        await login({ username, password })
        setSuccess('Account created!')
        setTimeout(() => navigate('/news'), 600)
      } catch (err) {
        setError(err?.response?.data?.message || 'Registration failed.')
      } finally {
        setSubmitting(false)
      }
    } else {
      setSubmitting(true)
      try {
        await login({ username, password })
        navigate('/news')
      } catch (err) {
        setError(err?.response?.data?.message || 'Login failed.')
      } finally {
        setSubmitting(false)
      }
    }
  }

  return (
    <div className="auth-page">
      <h1>{mode === 'login' ? 'Login' : 'Create Account'}</h1>
      
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-row">
          <label>Username</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
        </div>
        
        {mode === 'register' && (
          <div className="auth-row">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        )}
        
        <div className="auth-row">
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        {mode === 'register' && (
          <div className="auth-row">
            <label>Confirm Password</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
        )}

        {error && <div className="auth-error">{error}</div>}
        <button type="submit" disabled={submitting}>{submitting ? 'Processing...' : mode === 'login' ? 'Login' : 'Register'}</button>
      </form>

      <p className="auth-switch">
        {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
        <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Register' : 'Login'}</button>
      </p>
    </div>
  )
}

export default AuthPage

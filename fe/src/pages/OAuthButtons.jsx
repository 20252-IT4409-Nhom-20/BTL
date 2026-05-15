function GoogleIcon() {
  return (
    <svg className="oauth-icon" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.8.54-1.83.86-3.05.86-2.35 0-4.34-1.58-5.05-3.71H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.71A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.17.29-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.04l2.99-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58A9 9 0 0 0 9 0 9 9 0 0 0 .96 4.96L3.95 7.3C4.66 5.16 6.65 3.58 9 3.58z"
      />
    </svg>
  )
}

function OAuthButtons({ action }) {
  const handleOAuth = (provider) => {
    alert(`${action} with ${provider} failed.`)
  }

  return (
    <div className="auth-oauth">
      <button type="button" onClick={() => handleOAuth('Google')}>
        <GoogleIcon />
        Continue with Google
      </button>
      <button type="button" onClick={() => handleOAuth('GitHub')}>
        <svg className="oauth-icon" aria-hidden="true">
          <use href="/icons.svg#github-icon"></use>
        </svg>
        Continue with GitHub
      </button>
    </div>
  )
}

export default OAuthButtons

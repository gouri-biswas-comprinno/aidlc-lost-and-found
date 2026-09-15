import { useState } from 'react';
import { login, signup } from '../services/authService.js';

export default function AuthPanel({ mode, onModeChange, onAuthenticated }) {
  const isLogin = mode === 'login';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setNotice('');
    setError('');
    setSubmitting(true);

    try {
      if (isLogin) {
        const authResponse = await login({ email, password });
        onAuthenticated(authResponse);
      } else {
        await signup({ name, email, password });
        setNotice('Account created. Log in to continue.');
        onModeChange('login');
        setName('');
      }
      setEmail('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPassword('');
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-panel" aria-labelledby="auth-heading">
      <div className="auth-heading-row">
        <div>
          <p className="eyebrow">Community access</p>
          <h2 id="auth-heading">{isLogin ? 'Welcome back.' : 'Create an account.'}</h2>
        </div>
        <button className="text-button" type="button" onClick={() => onModeChange(isLogin ? 'signup' : 'login')}>
          {isLogin ? 'Need an account?' : 'Already registered?'}
        </button>
      </div>
      {notice && <p className="success-message" role="status">{notice}</p>}
      {error && <p className="auth-error" role="alert">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="auth-form-grid">
          {!isLogin && (
            <label>
              Name
              <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required />
            </label>
          )}
          <label>
            Email
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={isLogin ? 'current-password' : 'new-password'} minLength={isLogin ? undefined : 8} required />
          </label>
        </div>
        <div className="form-actions">
          <button className="primary-button" type="submit" disabled={submitting}>
            {submitting ? 'Working...' : isLogin ? 'Log in' : 'Create account'}
          </button>
          <button className="secondary-button" type="button" onClick={() => onModeChange('list')} disabled={submitting}>Back to reports</button>
        </div>
      </form>
    </section>
  );
}

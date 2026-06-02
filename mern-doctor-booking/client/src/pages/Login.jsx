import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const shouldRedirectDoctorToProfile = (user) => {
    if (!user || user.role !== 'doctor') return false;
    return !user.doctorProfile?.profileComplete;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'doctor') {
        if (shouldRedirectDoctorToProfile(user)) navigate('/doctor/profile');
        else navigate('/doctor');
      } else navigate('/patient');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    if (!email) {
      setError('Enter your email first, then click resend.');
      return;
    }
    try {
      const { data } = await api.post('/auth/resend-verification', { email });
      setInfo(data.message);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not resend');
    }
  };

  return (
    <div className="auth-page">
      <form className="card form-card" onSubmit={handleSubmit}>
        <h2>Welcome back</h2>
        <p className="muted">Seed users are already verified (run npm run seed)</p>
        {error && <p className="error">{error}</p>}
        {info && <p className="info-banner">{info}</p>}
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <div className="password-row">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="toggle-password-btn"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </label>
        <button type="submit" className="btn btn-block" disabled={loading}>
          {loading ? 'Signing in…' : 'Login'}
        </button>
        <p className="muted center">
          <button type="button" className="btn btn-ghost btn-sm" onClick={resendVerification}>
            Resend verification email
          </button>
        </p>
        <p className="muted center">
          No account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}

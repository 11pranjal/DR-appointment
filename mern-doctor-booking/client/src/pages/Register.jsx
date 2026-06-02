import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'patient',
    specialization: '',
    city: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        phone: form.phone ? `+977${form.phone}` : '',
        role: form.role,
      };
      if (form.role === 'doctor') {
        payload.doctorProfile = {
          specialization: form.specialization || 'General Physician',
          city: form.city || 'Kathmandu',
          consultationFee: 500,
        };
      }
      const data = await register(payload);
      setSuccess(data.message || 'Check your email to verify your account.');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="card form-card" onSubmit={handleSubmit}>
        <h2>Create account</h2>
        {error && <p className="error">{error}</p>}
        {success && <p className="info-banner">{success}</p>}
        <div className="row-2">
          <label>
            First name
            <input value={form.firstName} onChange={set('firstName')} required />
          </label>
          <label>
            Last name
            <input value={form.lastName} onChange={set('lastName')} required />
          </label>
        </div>
        <label>
          Email
          <input type="email" value={form.email} onChange={set('email')} required />
        </label>
        <label>
          Password
          <div className="password-row">
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={set('password')}
              minLength={6}
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
        <label>
          Phone (Nepal)
          <div className="phone-input-row" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ padding: '0.85rem 0.75rem', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '0.35rem' }}>+977</span>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
              placeholder="9841234567"
              pattern="\d{10}"
              title="Enter 10 digits after +977"
              required
              style={{ flex: 1 }}
            />
          </div>
        </label>
        <label>
          I am a
          <select value={form.role} onChange={set('role')}>
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
          </select>
        </label>
        {form.role === 'doctor' && (
          <>
            <p className="muted">Doctor accounts require admin approval before they can be activated.</p>
            <label>
              Specialization
              <input value={form.specialization} onChange={set('specialization')} />
            </label>
            <label>
              City
              <input value={form.city} onChange={set('city')} />
            </label>
          </>
        )}
        <button type="submit" className="btn btn-block" disabled={loading}>
          {loading ? 'Creating…' : 'Register'}
        </button>
        <p className="muted center">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

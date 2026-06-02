import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Book() {
  const { id } = useParams();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [doctorPosts, setDoctorPosts] = useState([]);
  const [form, setForm] = useState({
    scheduleDate: '',
    scheduleTime: '',
    reason: '',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/doctors/${id}`).then((res) => setDoctor(res.data.data));
    api.get(`/posts/doctor/${id}`).then((res) => setDoctorPosts(res.data.data)).catch(() => setDoctorPosts([]));
  }, [id]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let res;
      if (user?.role === 'patient' || user?.role === 'doctor') {
        res = await api.post('/appointments', {
          doctorId: id,
          scheduleDate: form.scheduleDate,
          scheduleTime: form.scheduleTime,
          reason: form.reason,
        });
      } else {
        res = await api.post('/appointments/guest', {
          doctorId: id,
          ...form,
        });
      }
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  if (!doctor) return <p className="page-center">Loading doctor…</p>;

  if (result) {
    return (
      <div className="page narrow">
        <div className="card success-card">
          <h2>Appointment booked</h2>
          <p>
            Your tracking ID: <strong className="tracking">{result.trackingId}</strong>
          </p>
          <p className="muted">Save this ID to check status anytime.</p>
          <Link to="/track" className="btn">
            Track appointment
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page narrow">
      <Link to="/doctors" className="back-link">
        ← Back to doctors
      </Link>
      <h1>
        Book Dr. {doctor.firstName} {doctor.lastName}
      </h1>
      <p className="muted">{doctor.doctorProfile?.specialization}</p>
      {/* Awareness posts removed per request; booking form below */}
      <form className="card form-card" onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}
        {!user && (
          <>
            <label>
              Your name
              <input value={form.guestName} onChange={set('guestName')} required />
            </label>
            <label>
              Email
              <input type="email" value={form.guestEmail} onChange={set('guestEmail')} required />
            </label>
            <label>
              Phone
              <input value={form.guestPhone} onChange={set('guestPhone')} required />
            </label>
          </>
        )}
        {user?.role === 'patient' && (
          <p className="info-banner">Booking as {user.firstName} {user.lastName}</p>
        )}
        {user?.role === 'doctor' && (
          <p className="info-banner">Booking as Dr. {user.firstName} {user.lastName}</p>
        )}
        {user && user.role !== 'patient' && user.role !== 'doctor' && (
          <p className="error">Log in as a patient, doctor, or book as guest.</p>
        )}
        <label>
          Date (pick or type)
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <select value={form.scheduleDate} onChange={set('scheduleDate')}>
              <option value="">Select a date</option>
              {Array.from({ length: 7 }).map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() + i);
                const iso = d.toISOString().slice(0, 10);
                const label = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
                return (
                  <option value={iso} key={iso}>
                    {label}
                  </option>
                );
              })}
            </select>
            <input
              type="date"
              min="2026-01-01"
              value={form.scheduleDate}
              onChange={(e) => setForm({ ...form, scheduleDate: e.target.value })}
            />
          </div>
        </label>
        <label>
          Time (choose or type)
          <div>
            <div className="time-options">
              {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'].map((t) => (
                <label key={t} className="time-radio">
                  <input
                    type="radio"
                    name="scheduleTime"
                    value={t}
                    checked={form.scheduleTime === t}
                    onChange={(e) => setForm({ ...form, scheduleTime: e.target.value })}
                  />
                  <span>{t}</span>
                </label>
              ))}
            </div>
            <div style={{ marginTop: 8 }}>
              <input
                type="time"
                value={form.scheduleTime}
                onChange={(e) => setForm({ ...form, scheduleTime: e.target.value })}
              />
            </div>
          </div>
        </label>
        <label>
          Reason for visit
          <textarea value={form.reason} onChange={set('reason')} rows={3} />
        </label>
        <button
          type="submit"
          className="btn btn-block"
          disabled={loading}
        >
          {loading ? 'Booking…' : 'Confirm booking'}
        </button>
      </form>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Book() {
  const { id } = useParams();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
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
  }, [id]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let res;
      if (user?.role === 'patient') {
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
        {user && user.role !== 'patient' && (
          <p className="error">Log in as a patient or book as guest (logout first).</p>
        )}
        <label>
          Date
          <input type="date" value={form.scheduleDate} onChange={set('scheduleDate')} required />
        </label>
        <label>
          Time
          <input type="time" value={form.scheduleTime} onChange={set('scheduleTime')} required />
        </label>
        <label>
          Reason for visit
          <textarea value={form.reason} onChange={set('reason')} rows={3} />
        </label>
        <button
          type="submit"
          className="btn btn-block"
          disabled={loading || (user && user.role !== 'patient')}
        >
          {loading ? 'Booking…' : 'Confirm booking'}
        </button>
      </form>
    </div>
  );
}

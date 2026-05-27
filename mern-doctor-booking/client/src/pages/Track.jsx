import { useState } from 'react';
import api from '../api/client';

const statusSteps = ['pending', 'confirmed', 'completed', 'cancelled'];

export default function Track() {
  const [trackingId, setTrackingId] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    setError('');
    setData(null);
    try {
      const res = await api.post('/appointments/track', { trackingId });
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Not found');
    }
  };

  return (
    <div className="page narrow">
      <h1>Track appointment</h1>
      <form className="card form-card" onSubmit={handleTrack}>
        <label>
          Tracking ID
          <input
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            placeholder="e.g. AB12CD34"
            required
          />
        </label>
        <button type="submit" className="btn btn-block">
          Track
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      {data && (
        <div className="card track-result">
          <p>
            Status: <span className={`badge badge-${data.status}`}>{data.status}</span>
          </p>
          <p>
            Doctor: Dr. {data.doctor?.firstName} {data.doctor?.lastName}
          </p>
          <p>
            When: {data.scheduleDate} at {data.scheduleTime}
          </p>
          <div className="timeline">
            {statusSteps.map((s) => (
              <div key={s} className={`timeline-step ${data.status === s ? 'active' : ''}`}>
                {s}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

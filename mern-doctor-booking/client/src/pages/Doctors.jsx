import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

const DOCTORS_PER_PAGE = 3;

export default function Doctors() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/doctors', { params: search ? { search } : {} });
        setDoctors(data.data);
        setPage(1);
      } catch {
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div className="page">
      <h1>Find a doctor</h1>
      <input
        className="search-input"
        placeholder="Search by name or specialization…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {loading && <p className="muted">Loading doctors…</p>}
      <div className="doctor-grid">
        {doctors.slice((page - 1) * DOCTORS_PER_PAGE, page * DOCTORS_PER_PAGE).map((d) => (
          <article key={d._id} className="card doctor-card">
            <div className="doctor-avatar">{d.firstName[0]}</div>
            <h3>
              Dr. {d.firstName} {d.lastName}
            </h3>
            <p className="tag">{d.doctorProfile?.specialization}</p>
            <p className="muted">
              {d.doctorProfile?.clinicName} · {d.doctorProfile?.city}
            </p>
            <p className="fee">Rs. {d.doctorProfile?.consultationFee}</p>
            <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
              <Link to={`/doctors/${d._id}`} className="btn btn-sm btn-block">
                View profile
              </Link>
              {user?.role === 'patient' && (
                <Link to={`/doctors/${d._id}/book`} className="btn btn-sm btn-block" style={{ backgroundColor: '#4CAF50' }}>
                  Book appointment
                </Link>
              )}
            </div>
          </article>
        ))}
      </div>
      {!loading && doctors.length === 0 && (
        <p className="muted">No doctors found. Run seed on the server first.</p>
      )}
      {!loading && doctors.length > DOCTORS_PER_PAGE && (
        <div className="pagination-row">
          {page > 1 && (
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            >
              Previous
            </button>
          )}
          <span>Page {page} of {Math.ceil(doctors.length / DOCTORS_PER_PAGE)}</span>
          {page < Math.ceil(doctors.length / DOCTORS_PER_PAGE) && (
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              onClick={() => setPage((prev) => Math.min(prev + 1, Math.ceil(doctors.length / DOCTORS_PER_PAGE)))}
            >
              Next
            </button>
          )}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import api from '../api/client';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    api.get('/admin/stats').then((res) => setStats(res.data.data));
    api.get('/appointments/all').then((res) => setAppointments(res.data.data));
  }, []);

  return (
    <div className="page">
      <h1>Admin overview</h1>
      {stats && (
        <div className="stats-row">
          <div className="card stat">
            <strong>{stats.doctors}</strong>
            <span>Doctors</span>
          </div>
          <div className="card stat">
            <strong>{stats.patients}</strong>
            <span>Patients</span>
          </div>
          <div className="card stat">
            <strong>{stats.appointments}</strong>
            <span>Appointments</span>
          </div>
          <div className="card stat">
            <strong>{stats.pendingAppointments}</strong>
            <span>Pending</span>
          </div>
        </div>
      )}
      <h2>All appointments</h2>
      <div className="table-wrap card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Doctor</th>
              <th>Patient</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a._id}>
                <td className="mono">{a.trackingId}</td>
                <td>
                  Dr. {a.doctor?.firstName} {a.doctor?.lastName}
                </td>
                <td>{a.patient?.email || a.guestEmail || '—'}</td>
                <td>
                  <span className={`badge badge-${a.status}`}>{a.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

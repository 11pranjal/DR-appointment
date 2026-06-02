import { useEffect, useState } from 'react';
import api from '../api/client';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [deletionRequests, setDeletionRequests] = useState([]);
  const [doctorRequests, setDoctorRequests] = useState([]);

  const loadStats = () => api.get('/admin/stats').then((res) => setStats(res.data.data));
  const loadAppointments = () => api.get('/appointments/all').then((res) => setAppointments(res.data.data));
  const loadDeletionRequests = () =>
    api.get('/users?deletionRequested=true').then((res) => setDeletionRequests(res.data.data));
  const loadDoctorRequests = () =>
    api.get('/users?role=doctor&approvalStatus=pending').then((res) => setDoctorRequests(res.data.data));

  useEffect(() => {
    loadStats();
    loadAppointments();
    loadDeletionRequests();
    loadDoctorRequests();
  }, []);

  const approveDeletion = async (id) => {
    if (!window.confirm('Approve account deletion for this user?')) return;
    await api.delete(`/users/${id}`);
    loadDeletionRequests();
    loadStats();
  };

  const denyDeletion = async (id) => {
    if (!window.confirm('Deny deletion request for this user?')) return;
    await api.put(`/users/${id}`, { deletionRequested: false });
    loadDeletionRequests();
  };

  const approveDoctor = async (id) => {
    if (!window.confirm('Approve this doctor request?')) return;
    await api.put(`/users/${id}`, { approvalStatus: 'approved' });
    loadDoctorRequests();
    loadStats();
  };

  const denyDoctor = async (id) => {
    if (!window.confirm('Deny this doctor request?')) return;
    await api.put(`/users/${id}`, { approvalStatus: 'denied' });
    loadDoctorRequests();
    loadStats();
  };

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
          <div className="card stat">
            <strong>{stats.deletionRequests}</strong>
            <span>Delete requests</span>
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
      <h2>Deletion requests</h2>
      <div className="table-wrap card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Requested At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {deletionRequests.length === 0 ? (
              <tr>
                <td colSpan={5} className="muted">
                  No deletion requests pending.
                </td>
              </tr>
            ) : (
              deletionRequests.map((user) => (
                <tr key={user._id}>
                  <td>
                    {user.firstName} {user.lastName}
                  </td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{new Date(user.deletionRequestedAt).toLocaleString()}</td>
                  <td>
                    <button type="button" onClick={() => approveDeletion(user._id)}>
                      Confirm
                    </button>
                    <button type="button" onClick={() => denyDeletion(user._id)}>
                      Deny
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <h2>Doctor approval requests</h2>
      <div className="table-wrap card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Requested At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {doctorRequests.length === 0 ? (
              <tr>
                <td colSpan={4} className="muted">
                  No pending doctor approvals.
                </td>
              </tr>
            ) : (
              doctorRequests.map((user) => (
                <tr key={user._id}>
                  <td>
                    {user.firstName} {user.lastName}
                  </td>
                  <td>{user.email}</td>
                  <td>{new Date(user.approvalRequestedAt).toLocaleString()}</td>
                  <td>
                    <button type="button" onClick={() => approveDoctor(user._id)}>
                      Accept
                    </button>
                    <button type="button" onClick={() => denyDoctor(user._id)}>
                      Deny
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

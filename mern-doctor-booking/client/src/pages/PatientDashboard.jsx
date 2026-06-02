import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function PatientDashboard() {
  const [list, setList] = useState([]);

  const load = () => api.get('/appointments').then((res) => setList(res.data.data));

  useEffect(() => {
    load();
  }, []);

  const cancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    await api.delete(`/appointments/${id}`);
    load();
  };

  const acceptProposed = async (id) => {
    if (!window.confirm('Accept the proposed slot?')) return;
    await api.post(`/appointments/${id}/accept`);
    load();
  };

  return (
    <div className="page">
      <h1>My appointments</h1>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <Link to="/doctors" className="btn btn-sm">
        Book new
        </Link>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={async () => {
            if (!window.confirm('Request account deletion? Admin will confirm.')) return;
            try {
              const res = await api.get('/auth/me');
              const id = res.data.user._id;
              await api.delete(`/users/${id}`);
              alert('Deletion requested. Admin will confirm.');
            } catch (err) {
              alert(err.response?.data?.message || 'Could not request deletion');
            }
          }}
        >
          Delete account
        </button>
      </div>
      <div className="table-wrap card">
        <table>
          <thead>
            <tr>
              <th>Tracking</th>
              <th>Doctor</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((a) => (
              <tr key={a._id}>
                <td className="mono">{a.trackingId}</td>
                <td>
                  Dr. {a.doctor?.firstName} {a.doctor?.lastName}
                </td>
                <td>
                  {a.scheduleDate} {a.scheduleTime}
                </td>
                <td>
                  <span className={`badge badge-${a.status}`}>{a.status}</span>
                </td>
                <td>
                  {a.status === 'pending' && (
                    <button type="button" className="btn btn-sm btn-outline" onClick={() => cancel(a._id)}>
                      Cancel
                    </button>
                  )}
                  {a.status === 'proposed' && (
                    <>
                      <div className="muted">Proposed: {a.proposedDate} {a.proposedTime}</div>
                      <button type="button" className="btn btn-sm" onClick={() => acceptProposed(a._id)}>
                        Accept proposed
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="muted pad">No appointments yet.</p>}
      </div>

    </div>
  );
}

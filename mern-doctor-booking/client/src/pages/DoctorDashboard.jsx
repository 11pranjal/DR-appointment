import { useEffect, useState } from 'react';
import api from '../api/client';

export default function DoctorDashboard() {
  const [list, setList] = useState([]);

  const load = () => api.get('/appointments').then((res) => setList(res.data.data));

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    await api.patch(`/appointments/${id}`, { status });
    load();
  };

  const propose = async (id) => {
    const proposedDate = window.prompt('Proposed date (YYYY-MM-DD):');
    if (!proposedDate) return;
    const proposedTime = window.prompt('Proposed time (HH:MM):');
    if (!proposedTime) return;
    const proposedMessage = window.prompt('Optional message to patient:') || '';
    try {
      await api.post(`/appointments/${id}/propose`, { proposedDate, proposedTime, proposedMessage });
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not propose slot');
    }
  };

  return (
    <div className="page">
      <h1>Doctor dashboard</h1>
      <p className="muted">Confirm or complete patient appointments</p>
      <div className="table-wrap card">
        <table>
          <thead>
            <tr>
              <th>Patient / Guest</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((a) => (
              <tr key={a._id}>
                <td>
                  {a.patient
                    ? `${a.patient.firstName} ${a.patient.lastName}`
                    : a.guestName}
                </td>
                <td>
                  {a.scheduleDate} {a.scheduleTime}
                </td>
                <td>
                  <span className={`badge badge-${a.status}`}>{a.status}</span>
                </td>
                <td className="actions">
                  {a.status === 'pending' && (
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => updateStatus(a._id, 'confirmed')}
                    >
                      Confirm
                    </button>
                  )}
                  {a.status !== 'completed' && (
                    <button type="button" className="btn btn-sm btn-ghost" onClick={() => propose(a._id)}>
                      Propose time
                    </button>
                  )}
                  {a.status === 'confirmed' && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
                      onClick={() => updateStatus(a._id, 'completed')}
                    >
                      Complete
                    </button>
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

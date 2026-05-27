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

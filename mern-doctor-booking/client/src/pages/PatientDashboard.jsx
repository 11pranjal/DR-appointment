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

  return (
    <div className="page">
      <h1>My appointments</h1>
      <Link to="/doctors" className="btn btn-sm">
        Book new
      </Link>
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

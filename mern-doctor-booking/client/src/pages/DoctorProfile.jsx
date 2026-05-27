import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function DoctorProfile() {
  const { user, setSession } = useAuth();
  const [profile, setProfile] = useState(user?.doctorProfile || {});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => setProfile(user?.doctorProfile || {}), [user]);

  const save = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      const { data } = await api.put(`/users/${user._id}`, { doctorProfile: profile });
      setSession(localStorage.getItem('token'), data.data);
      setMsg('Saved');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Could not save');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p className="page-center">Loading…</p>;

  return (
    <div className="page narrow">
      <h1>My profile</h1>
      <form className="card form-card" onSubmit={save}>
        {msg && <p className="muted">{msg}</p>}
        <label>
          Specialization
          <input value={profile.specialization || ''} onChange={(e) => setProfile({ ...profile, specialization: e.target.value })} />
        </label>
        <label>
          Consultation fee
          <input type="number" value={profile.consultationFee || 0} onChange={(e) => setProfile({ ...profile, consultationFee: Number(e.target.value) })} />
        </label>
        <label>
          City
          <input value={profile.city || ''} onChange={(e) => setProfile({ ...profile, city: e.target.value })} />
        </label>
        <button className="btn btn-block" disabled={loading} type="submit">{loading ? 'Saving…' : 'Save'}</button>
        <button
          type="button"
          className="btn btn-ghost"
          style={{ marginTop: 12 }}
          onClick={async () => {
            if (!window.confirm('Request account deletion? Admin will confirm.')) return;
            try {
              await api.delete(`/users/${user._id}`);
              alert('Deletion requested. Admin will confirm.');
            } catch (err) {
              alert(err.response?.data?.message || 'Could not request deletion');
            }
          }}
        >
          Delete account
        </button>
      </form>
    </div>
  );
}

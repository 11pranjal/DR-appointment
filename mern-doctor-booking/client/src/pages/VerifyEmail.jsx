import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [message, setMessage] = useState('Verifying your email…');
  const [ok, setOk] = useState(false);

  useEffect(() => {
    api
      .get(`/auth/verify-email/${token}`)
      .then((res) => {
        setSession(res.data.token, res.data.user);
        setOk(true);
        setMessage('Email verified! Redirecting…');
        const role = res.data.user.role;
        setTimeout(() => {
          if (role === 'admin') navigate('/admin');
          else if (role === 'doctor') navigate('/doctor');
          else navigate('/patient');
        }, 1500);
      })
      .catch((err) => {
        setMessage(err.response?.data?.message || 'Verification failed.');
      });
  }, [token, navigate, setSession]);

  return (
    <div className="auth-page">
      <div className="card form-card center">
        <h2>Email verification</h2>
        <p className={ok ? 'info-banner' : 'error'}>{message}</p>
        {!ok && (
          <p className="muted">
            <Link to="/login">Back to login</Link>
          </p>
        )}
      </div>
    </div>
  );
}

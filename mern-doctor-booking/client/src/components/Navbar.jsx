import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const dashboardPath =
    user?.role === 'admin'
      ? '/admin'
      : user?.role === 'doctor'
        ? '/doctor'
        : user?.role === 'patient'
          ? '/patient'
          : null;

  return (
    <header className="navbar">
      <Link to="/" className="logo">
        Medi<span>Book</span>
      </Link>
      <nav>
        <Link to="/doctors">Browse</Link>
        <Link to="/posts">Awareness</Link>
        {!user && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="btn btn-sm">
              Sign up
            </Link>
          </>
        )}
        {user && (
          <>
            {dashboardPath && <Link to={dashboardPath}>Dashboard</Link>}
              {user?.role === 'doctor' && <Link to="/doctor/profile">Profile</Link>}
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              Logout
            </button>
          </>
        )}
      </nav>
    </header>
  );
}

import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <section className="hero">
      <div className="hero-content">
        <p className="eyebrow">MERN stack · MongoDB Atlas · Postman-ready API</p>
        <h1>Book doctors online, track every visit</h1>
        <p className="lead">
          A portfolio-friendly clinic booking app. Patients book slots, doctors manage
          appointments, guests book without an account — all backed by a REST API you can test
          in Postman.
        </p>
        <div className="hero-actions">
          <Link to="/doctors" className="btn">
            Browse doctors
          </Link>
          <Link to="/track" className="btn btn-outline">
            Track with ID
          </Link>
        </div>
      </div>
      <div className="hero-cards">
        <div className="stat-card">
          <strong>3 roles</strong>
          <span>Patient · Doctor · Admin</span>
        </div>
        <div className="stat-card">
          <strong>JWT auth</strong>
          <span>Bearer token in Postman</span>
        </div>
        <div className="stat-card">
          <strong>Guest booking</strong>
          <span>No login required</span>
        </div>
      </div>
    </section>
  );
}

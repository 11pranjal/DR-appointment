import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Doctors from './pages/Doctors';
import Posts from './pages/Posts';
import Book from './pages/Book';
import Track from './pages/Track';
import VerifyEmail from './pages/VerifyEmail';
import CreatePost from './pages/CreatePost';
import DoctorProfile from './pages/DoctorProfile';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/posts" element={<Posts />} />
          <Route path="/doctor/posts" element={<PrivateRoute roles={["doctor"]}><CreatePost /></PrivateRoute>} />
          <Route path="/doctors/:id/book" element={<Book />} />
          <Route path="/track" element={<Track />} />
          <Route
            path="/patient"
            element={
              <PrivateRoute roles={['patient']}>
                <PatientDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/doctor"
            element={
              <PrivateRoute roles={['doctor']}>
                <DoctorDashboard />
              </PrivateRoute>
            }
          />
          <Route path="/doctor/profile" element={<PrivateRoute roles={["doctor"]}><DoctorProfile /></PrivateRoute>} />
          <Route
            path="/admin"
            element={
              <PrivateRoute roles={['admin']}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
      <footer className="footer">
        <p>© 2026 MediBook. All rights reserved. © Pranjal Thapa</p>
      </footer>
    </>
  );
}

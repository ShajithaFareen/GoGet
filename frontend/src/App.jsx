import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Home from './pages/Home';
import LoginRegister from './pages/LoginRegister';
import CreateRequest from './pages/CreateRequest';
import ViewRequests from './pages/ViewRequests';
import DonorDashboard from './pages/DonorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { LogOut, Heart, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar glass-panel" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Heart color="var(--primary)" size={28} />
        <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main)' }}>Go Get</Link>
      </div>
      <div className="nav-links">
        {(!user || user.role === 'Needy') && <Link to="/create-request">Get Help</Link>}
        {user ? (
          <>
            {user.role === 'Donor' && <Link to="/requests">Requests</Link>}
            {user.role === 'Donor' && <Link to="/donor-dashboard">Dashboard</Link>}
            {user.role === 'Admin' && <Link to="/admin-dashboard">Admin Panel</Link>}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem' }}>
              <UserIcon size={18} />
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{user.name || user.phone}</span>
              <button onClick={logout} className="btn" style={{ padding: '0.4rem', background: 'transparent', color: 'var(--danger)' }}>
                <LogOut size={18} />
              </button>
            </div>
          </>
        ) : (
          <Link to="/login" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Login / Register</Link>
        )}
      </div>
    </nav>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="container animate-fade-in">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginRegister />} />
          <Route path="/create-request" element={
            <ProtectedRoute allowedRoles={['Needy']}>
              <CreateRequest />
            </ProtectedRoute>
          } />
          
          <Route path="/requests" element={
            <ProtectedRoute allowedRoles={['Donor', 'Admin']}>
              <ViewRequests />
            </ProtectedRoute>
          } />
          
          <Route path="/donor-dashboard" element={
            <ProtectedRoute allowedRoles={['Donor']}>
              <DonorDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin-dashboard" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;

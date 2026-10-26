import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle, User, LogOut, Eye, CheckSquare } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const DonorDashboard = () => {
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(null);
  const [activeTab, setActiveTab] = useState('accepted');
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyRequests();
  }, [user?.id]);

  const fetchMyRequests = async () => {
    try {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      const config = {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      };
      const res = await axios.get(`${API_URL}/requests`, config);
      const currentUserId = user.id?.toString() || user._id?.toString();
      const filtered = res.data.filter(req => {
        if (!req.assignedDonor) return false;
        const assignedDonorId = req.assignedDonor._id ? req.assignedDonor._id.toString() : req.assignedDonor.toString();
        return assignedDonorId === currentUserId;
      });
      setMyRequests(filtered);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard requests', error);
      setLoading(false);
    }
  };

  const handleComplete = async (id) => {
    try {
      setCompleting(id);
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/requests/${id}/complete`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      await fetchMyRequests();
      setCompleting(null);
    } catch (error) {
      alert(error.response?.data?.message || 'Error completing request');
      setCompleting(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading dashboard...</div>;

  const acceptedRequests = myRequests.filter(r => r.status === 'Accepted');
  const completedRequests = myRequests.filter(r => r.status === 'Completed');

  const renderAccepted = () => {
    if (acceptedRequests.length === 0) {
      return (
        <div className="card glass-panel" style={{ textAlign: 'center', padding: '2rem' }}>
          <p>No accepted requests yet.</p>
          <p style={{ color: 'var(--text-muted)' }}>Accept a request from the requests page to see it here.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
        {acceptedRequests.map(req => (
          <div key={req._id} className="card glass-panel" style={{ borderLeft: '4px solid var(--warning)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>{req.category} Need</h3>
              <span className="badge badge-accepted">In Progress</span>
            </div>
            <p>{req.description}</p>
            <div style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <strong>Location:</strong> {req.location} <br />
              <strong>Contact:</strong> {req.phone} {req.name ? `(${req.name})` : ''} <br />
              <strong>Urgency:</strong> <span className={`badge badge-${req.urgency}`}>{req.urgency}</span>
            </div>
            <button
              onClick={() => handleComplete(req._id)}
              disabled={completing === req._id}
              className="btn btn-secondary"
              style={{ marginTop: '1rem', width: '100%' }}
            >
              {completing === req._id ? '⏳ Completing...' : '✓ Mark as Completed'}
            </button>
          </div>
        ))}
      </div>
    );
  };

  const renderCompleted = () => {
    if (completedRequests.length === 0) {
      return (
        <div className="card glass-panel" style={{ textAlign: 'center', padding: '2rem' }}>
          <p>No completed requests yet.</p>
          <p style={{ color: 'var(--text-muted)' }}>Complete a request to find it here.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
        {completedRequests.map(req => (
          <div key={req._id} className="card glass-panel" style={{ borderLeft: '4px solid var(--secondary)', opacity: 0.95 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>{req.category} Need</h3>
              <span className="badge badge-completed">Completed</span>
            </div>
            <p>{req.description}</p>
            <div style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <strong>Location:</strong> {req.location} <br />
              <strong>Contact:</strong> {req.phone} {req.name ? `(${req.name})` : ''} <br />
              <strong>Completed on:</strong> {new Date(req.completedAt || req.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderProfile = () => (
    <div className="card glass-panel" style={{ padding: '2rem', maxWidth: '600px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <User size={28} color="var(--primary)" />
        <div>
          <h3 style={{ margin: 0 }}>{user.name || 'Donor'}</h3>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Role: {user.role}</p>
        </div>
      </div>
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        <div><strong>Email:</strong> {user.email || 'N/A'}</div>
        <div><strong>Phone:</strong> {user.phone || 'N/A'}</div>
        {user.location && <div><strong>Location:</strong> {user.location}</div>}
      </div>
    </div>
  );

  return (
    <div style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>Donor Dashboard</h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>Manage your requests and profile from one place.</p>
        </div>
        <button onClick={handleLogout} className="btn btn-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <LogOut size={18} /> Logout
        </button>
      </div>

      <div className="card glass-panel" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.5rem' }}>
        <button className="btn btn-primary" onClick={() => navigate('/requests')} style={{ minWidth: '160px' }}>
          <Eye size={16} /> View Requests
        </button>
        <button className={`btn ${activeTab === 'accepted' ? 'btn-secondary' : 'glass-panel'}`} onClick={() => setActiveTab('accepted')} style={{ minWidth: '160px' }}>
          <CheckSquare size={16} /> Accepted Requests
        </button>
        <button className={`btn ${activeTab === 'completed' ? 'btn-secondary' : 'glass-panel'}`} onClick={() => setActiveTab('completed')} style={{ minWidth: '160px' }}>
          <CheckCircle size={16} /> Completed Requests
        </button>
        <button className={`btn ${activeTab === 'profile' ? 'btn-secondary' : 'glass-panel'}`} onClick={() => setActiveTab('profile')} style={{ minWidth: '160px' }}>
          <User size={16} /> Profile
        </button>
      </div>

      <div style={{ marginTop: '2rem' }}>
        {activeTab === 'accepted' && (
          <>
            <h3>Accepted Requests by Me ({acceptedRequests.length})</h3>
            {renderAccepted()}
          </>
        )}
        {activeTab === 'completed' && (
          <>
            <h3>Completed Requests ({completedRequests.length})</h3>
            {renderCompleted()}
          </>
        )}
        {activeTab === 'profile' && (
          <>
            <h3>Profile</h3>
            {renderProfile()}
          </>
        )}
      </div>
    </div>
  );
};

export default DonorDashboard;

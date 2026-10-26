import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Users, CheckSquare, AlertTriangle } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(null);
  const [completing, setCompleting] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { 'Authorization': `Bearer ${token}` } } : {};
      
      const [statsRes, reqsRes] = await Promise.all([
        axios.get(`${API_URL}/admin/dashboard`, config),
        axios.get(`${API_URL}/requests`, config)
      ]);
      setStats(statsRes.data);
      setRequests(reqsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching admin data', error);
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    try {
      setVerifying(id);
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/requests/${id}/verify`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData(); // Refresh data
      setVerifying(null);
    } catch (error) {
      alert(error.response?.data?.message || 'Error verifying request');
      setVerifying(null);
    }
  };

  const handleComplete = async (id) => {
    try {
      setCompleting(id);
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/requests/${id}/complete`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData(); // Refresh data
      setCompleting(null);
    } catch (error) {
      alert(error.response?.data?.message || 'Error completing request');
      setCompleting(null);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading admin dashboard...</div>;

  const pendingRequests = requests.filter(r => r.status === 'Pending');

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2 style={{ marginBottom: '2rem' }}>Admin Dashboard</h2>

      <div className="grid grid-cols-4" style={{ marginBottom: '3rem' }}>
        <div className="card glass-panel" style={{ alignItems: 'center', padding: '1rem' }}>
          <Activity size={24} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
          <h3 style={{ margin: 0, fontSize: '2rem' }}>{stats.totalRequests}</h3>
          <p style={{ fontSize: '0.9rem', margin: 0 }}>Total Requests</p>
        </div>
        <div className="card glass-panel" style={{ alignItems: 'center', padding: '1rem' }}>
          <AlertTriangle size={24} color="var(--warning)" style={{ marginBottom: '0.5rem' }} />
          <h3 style={{ margin: 0, fontSize: '2rem' }}>{stats.pendingRequests}</h3>
          <p style={{ fontSize: '0.9rem', margin: 0 }}>Pending</p>
        </div>
        <div className="card glass-panel" style={{ alignItems: 'center', padding: '1rem' }}>
          <CheckSquare size={24} color="var(--secondary)" style={{ marginBottom: '0.5rem' }} />
          <h3 style={{ margin: 0, fontSize: '2rem' }}>{stats.completedRequests}</h3>
          <p style={{ fontSize: '0.9rem', margin: 0 }}>Completed</p>
        </div>
        <div className="card glass-panel" style={{ alignItems: 'center', padding: '1rem' }}>
          <Users size={24} color="#a855f7" style={{ marginBottom: '0.5rem' }} />
          <h3 style={{ margin: 0, fontSize: '2rem' }}>{stats.activeDonors}</h3>
          <p style={{ fontSize: '0.9rem', margin: 0 }}>Active Donors</p>
        </div>
      </div>

      <h3>Pending Approvals ({pendingRequests.length})</h3>
      
      {pendingRequests.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No pending requests to approve at this time.</p>
      ) : (
        <div className="grid grid-cols-2">
          {pendingRequests.map(req => (
            <div key={req._id} className="card glass-panel" style={{ borderLeft: '4px solid var(--danger)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span className={`badge badge-${req.urgency}`}>{req.urgency} Urgency</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(req.createdAt).toLocaleDateString()}</span>
              </div>
              
              <h4 style={{ margin: '0.5rem 0' }}>{req.category} Need</h4>
              <p>{req.description}</p>
              
              <div style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <strong>Location:</strong> {req.location} <br />
                <strong>Contact:</strong> {req.phone} {req.name ? `(${req.name})` : ''}
              </div>

              <button 
                onClick={() => handleVerify(req._id)} 
                disabled={verifying === req._id}
                className="btn btn-primary" 
                style={{ marginTop: '1rem', width: '100%' }}
              >
                {verifying === req._id ? '⏳ Verifying...' : '✓ Approve & Verify'}
              </button>
            </div>
          ))}
        </div>
      )}

      <h3 style={{ marginTop: '3rem' }}>Active Requests (Verified & Accepted)</h3>
      
      {requests.filter(r => r.status === 'Verified' || r.status === 'Accepted').length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No active requests.</p>
      ) : (
        <div className="grid grid-cols-2">
          {requests.filter(r => r.status === 'Verified' || r.status === 'Accepted').map(req => (
            <div key={req._id} className="card glass-panel" style={{ borderLeft: `4px solid ${req.status === 'Accepted' ? 'var(--warning)' : 'var(--primary)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span className={`badge badge-${req.status.toLowerCase()}`}>{req.status}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(req.createdAt).toLocaleDateString()}</span>
              </div>
              
              <h4 style={{ margin: '0.5rem 0' }}>{req.category} Need</h4>
              <p>{req.description}</p>
              
              <div style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <strong>Location:</strong> {req.location} <br />
                <strong>Contact:</strong> {req.phone} {req.name ? `(${req.name})` : ''}<br />
                {req.assignedDonor && <><strong>Donor:</strong> {req.assignedDonor.name || 'Unknown'}</>}
              </div>

              <button 
                onClick={() => handleComplete(req._id)} 
                disabled={completing === req._id}
                className="btn btn-secondary" 
                style={{ marginTop: '1rem', width: '100%' }}
              >
                {completing === req._id ? '⏳ Completing...' : '✓ Mark as Complete'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

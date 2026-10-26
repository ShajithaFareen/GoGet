import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { MapPin, Phone, AlertCircle, CheckCircle } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const ViewRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [accepting, setAccepting] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user?.id) {
      fetchRequests();
    }
  }, [user?.id]);

  const fetchRequests = async () => {
    try {
      // Explicitly pass token in headers to ensure it's sent
      const config = { 
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } 
      };
      const res = await axios.get(`${API_URL}/requests`, config);
      setRequests(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching requests', error);
      // Show error to user for debugging
      if (error.response?.status === 401) {
        console.error('Unauthorized - Please login first');
      }
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      setAccepting(id);
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/requests/${id}/accept`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchRequests(); // Refresh list
      setAccepting(null);
    } catch (error) {
      alert(error.response?.data?.message || 'Error accepting request');
      setAccepting(null);
    }
  };

  const filteredRequests = requests.filter(req => {
    // Show verified and not yet assigned requests
    if (req.status !== 'Verified') return false;
    
    if (filter === 'All') return true;
    return req.category === filter;
  });

  if (loading) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading verified requests...</div>;

  return (
    <div style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Available Requests (Verified)</h2>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: 'auto', marginBottom: 0 }}>
          <option value="All">All Categories</option>
          <option value="Food">Food</option>
          <option value="Medical">Medical</option>
          <option value="Clothes">Clothes</option>
          <option value="Emergency">Emergency</option>
        </select>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="card glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
          <CheckCircle size={48} color="var(--secondary)" style={{ margin: '0 auto 1rem auto' }} />
          <h3>No pending requests!</h3>
          <p>Thank you for helping out. Currently, all verified requests have been assigned.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2">
          {filteredRequests.map(req => (
            <div key={req._id} className="card glass-panel animate-fade-in" style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className={`badge badge-${req.urgency}`}>{req.urgency} Urgency</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(req.createdAt).toLocaleDateString()}</span>
              </div>
              
              <h3 style={{ margin: '0.5rem 0 0 0', color: 'var(--primary)' }}>{req.category} Need</h3>
              <p style={{ color: 'var(--text-main)', fontSize: '1.1rem' }}>{req.description}</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                  <MapPin size={16} /> {req.location}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                  <Phone size={16} /> {req.phone} {req.name ? `(${req.name})` : ''}
                </div>
              </div>

              {user?.role === 'Donor' && req.status === 'Verified' && (
                <button 
                  onClick={() => handleAccept(req._id)} 
                  disabled={accepting === req._id}
                  className="btn btn-primary" 
                  style={{ marginTop: '1rem', width: '100%' }}
                >
                  {accepting === req._id ? '⏳ Accepting...' : '✓ Accept Request'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewRequests;

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

const CreateRequest = () => {
  const [activeTab, setActiveTab] = useState('web');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    category: 'Food',
    description: '',
    urgency: 'High'
  });
  const [message, setMessage] = useState('');
  
  const navigate = useNavigate();

  const handleWebSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/requests`, formData);
      setMessage('Request submitted successfully!');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error submitting request');
    }
  };

  const handleSmsSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/requests`, { ...formData, sendViaTwilio: true });
      setMessage('Request submitted and SMS sent via Twilio!');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error sending request via Twilio');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '3rem auto' }}>
      <h2 style={{ textAlign: 'center' }}>Request Assistance</h2>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center' }}>
        <button 
          className={`btn ${activeTab === 'web' ? 'btn-primary' : 'glass-panel'}`}
          onClick={() => setActiveTab('web')}
        >
          Web Form
        </button>
        <button 
          className={`btn ${activeTab === 'sms' ? 'btn-primary' : 'glass-panel'}`}
          onClick={() => setActiveTab('sms')}
        >
          SMS via Twilio
        </button>
      </div>

      {message && <div style={{ textAlign: 'center', marginBottom: '1rem', padding: '1rem', background: message.includes('success') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', borderRadius: '8px' }}>{message}</div>}

      <div className="card glass-panel animate-fade-in">
        {activeTab === 'web' ? (
          <form onSubmit={handleWebSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
              <input type="text" placeholder="Your Name (Optional)" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input type="text" placeholder="Phone Number (Required)" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            
            <input type="text" placeholder="Location / Address" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
            
            <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option value="Food">Food</option>
                <option value="Medical">Medical</option>
                <option value="Clothes">Clothes</option>
                <option value="Emergency">Emergency</option>
              </select>
              <select value={formData.urgency} onChange={e => setFormData({...formData, urgency: e.target.value})}>
                <option value="High">High Urgency</option>
                <option value="Medium">Medium Urgency</option>
                <option value="Low">Low Urgency</option>
              </select>
            </div>
            
            <textarea placeholder="Describe what you need..." rows="4" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
            
            <button type="submit" className="btn btn-primary">Submit Request</button>
          </form>
        ) : (
          <form onSubmit={handleSmsSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: 'rgba(0,0,0,0.03)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>This option sends your request via Twilio SMS to the help network.</p>
              <p style={{ margin: 0 }}>We will save the request and deliver a live SMS through the configured Twilio service.</p>
            </div>

            <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
              <input type="text" placeholder="Your Name (Optional)" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input type="text" placeholder="Phone Number (Required)" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            
            <input type="text" placeholder="Location / Address" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
            
            <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option value="Food">Food</option>
                <option value="Medical">Medical</option>
                <option value="Clothes">Clothes</option>
                <option value="Emergency">Emergency</option>
              </select>
              <select value={formData.urgency} onChange={e => setFormData({...formData, urgency: e.target.value})}>
                <option value="High">High Urgency</option>
                <option value="Medium">Medium Urgency</option>
                <option value="Low">Low Urgency</option>
              </select>
            </div>

            <textarea placeholder="Describe what you need..." rows="4" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
            
            <button type="submit" className="btn btn-secondary">Send Request via Twilio</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateRequest;

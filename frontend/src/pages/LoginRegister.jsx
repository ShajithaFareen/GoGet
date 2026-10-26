import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const LoginRegister = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'Donor',
    location: ''
  });
  const [error, setError] = useState('');
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password, phone: formData.phone }
        : formData;

      const res = await axios.post(`${API_URL}${endpoint}`, payload);
      
      login(res.data.user, res.data.token);
      
      if (res.data.user.role === 'Admin') navigate('/admin-dashboard');
      else if (res.data.user.role === 'Donor') navigate('/requests');
      else navigate('/');
      
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>
      <div className="card glass-panel" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          {isLogin ? 'Welcome Back' : 'Create an Account'}
        </h2>
        
        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '4px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
          {!isLogin && (
            <>
              <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="Donor">Donor</option>
                <option value="Volunteer">Volunteer</option>
                <option value="Needy">Needy</option>
                <option value="Admin">Admin</option>
              </select>
              <input type="text" name="location" placeholder="City/Location" value={formData.location} onChange={handleChange} required />
            </>
          )}
          
          <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} />
          
          {isLogin && <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', margin: '-0.5rem 0 0.5rem 0' }}>OR</p>}
          
          <input type="text" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} />
          
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required={!isLogin || !!formData.email} />
          
          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span style={{ color: 'var(--primary)', cursor: 'pointer' }} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Register here' : 'Login here'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginRegister;

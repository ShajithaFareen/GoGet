import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, HeartHandshake, PhoneCall } from 'lucide-react';

const Home = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: '4rem', gap: '2rem' }}>
      
      <div style={{ maxWidth: '800px' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', background: 'linear-gradient(to right, var(--primary), #a855f7)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
          Smart Donation & Help Connectivity
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>
          Connecting those in need with those who can help. Request assistance instantly via web or Twilio SMS, and let our verified network of donors and volunteers assist you.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <Link to="/create-request" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
          Get Help Now
        </Link>
        <Link to="/login" className="btn glass-panel" style={{ padding: '1rem 2rem', fontSize: '1.1rem', color: 'white' }}>
          Become a Donor
        </Link>
      </div>

      <div className="grid grid-cols-3" style={{ marginTop: '5rem', width: '100%', gap: '2rem' }}>
        <div className="card glass-panel" style={{ alignItems: 'center' }}>
          <div style={{ background: 'rgba(79, 70, 229, 0.2)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
            <PhoneCall size={32} color="var(--primary)" />
          </div>
          <h3>Easy Requests</h3>
          <p>No smartphone? No problem. Use our Twilio SMS request option to request help instantly.</p>
        </div>
        <div className="card glass-panel" style={{ alignItems: 'center' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
            <ShieldCheck size={32} color="var(--secondary)" />
          </div>
          <h3>Verified Needs</h3>
          <p>Every request is verified by our admins and volunteers to ensure authenticity.</p>
        </div>
        <div className="card glass-panel" style={{ alignItems: 'center' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
            <HeartHandshake size={32} color="var(--warning)" />
          </div>
          <h3>Fast Matching</h3>
          <p>Location-based sorting ensures help reaches the needy as quickly as possible.</p>
        </div>
      </div>

    </div>
  );
};

export default Home;

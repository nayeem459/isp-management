import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Login({ setAuth }) {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/login`, {
        id: id.trim(),
        password
      });

      const loggedInUser = res.data.user;
      localStorage.setItem('ispUser', JSON.stringify(loggedInUser));
      setAuth(loggedInUser);
    } catch (err) {
      setError(err.response?.data?.message || 'লগইন করা যায়নি। সঠিক ID এবং Password দিন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '75px auto', padding: '30px', border: '1px solid #e2e8f0', borderRadius: '12px', fontFamily: 'sans-serif', boxShadow: '0 6px 18px rgba(0,0,0,0.06)', background: '#fff' }}>
      <h2 style={{ textAlign: 'center', color: '#1e40af', margin: '0 0 6px 0' }}>ISP Management System</h2>
      <p style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', margin: '0 0 22px 0' }}>
        আপনার ID এবং Password দিয়ে লগইন করুন
      </p>

      {error && (
        <div style={{ color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '13px', textAlign: 'center' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', fontSize: '14px', marginBottom: '6px', color: '#1e293b' }}>
            User / Admin / Technician ID
          </label>
          <input
            type="text"
            placeholder="যেমন: USR-101, ADMIN-01, TECH-01"
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
            style={{ width: '100%', padding: '11px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
          />
        </div>

        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', fontSize: '14px', marginBottom: '6px', color: '#1e293b' }}>
            Password
          </label>
          <input
            type="password"
            placeholder="আপনার পাসওয়ার্ড দিন"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '11px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div style={{ marginTop: '20px', padding: '12px', background: '#f8fafc', borderRadius: '8px', fontSize: '12px', color: '#475569', lineHeight: '1.6' }}>
        <strong>Demo Accounts (Password: 123):</strong><br />
        • <strong>User:</strong> <code>USR-101</code><br />
        • <strong>Admin:</strong> <code>ADMIN-01</code><br />
        • <strong>Technician:</strong> <code>TECH-01</code>
      </div>
    </div>
  );
}
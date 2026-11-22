import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

export default function TechDashboard({ user, logout }) {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState('Pending');
  const [notes, setNotes] = useState({});
  const [notification, setNotification] = useState('');
  const prevPendingIdsRef = useRef([]);
  const isFirstLoadRef = useRef(true);

  const playNotificationBeep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {
      // ignore audio block
    }
  };

  const loadTickets = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/tickets');
      const all = res.data;
      const pendingList = all.filter((t) => t.status === 'Pending');
      const pendingIds = pendingList.map((t) => t.id);

      if (!isFirstLoadRef.current) {
        const newlyArrived = pendingList.filter((t) => !prevPendingIdsRef.current.includes(t.id));
        if (newlyArrived.length > 0) {
          const latest = newlyArrived[0];
          setNotification(
            `নতুন Complain Ticket এসেছে! Ticket No: ${latest.id} | User: ${latest.userName} (${latest.userId}) | Location: ${latest.location || 'Not Provided'}`
          );
          playNotificationBeep();
        }
      } else {
        isFirstLoadRef.current = false;
      }

      prevPendingIdsRef.current = pendingIds;
      setTickets(all);
    } catch (err) {
      console.error('Error loading tickets:', err);
    }
  };

  useEffect(() => {
    loadTickets();
    const interval = setInterval(loadTickets, 4000);
    return () => clearInterval(interval);
  }, []);

  const markSolved = async (ticket) => {
    try {
      const noteText = notes[ticket.id]?.trim();
      const updatedIssue = noteText
        ? `${ticket.issue} [Tech Note: ${noteText}]`
        : ticket.issue;

      await axios.put(`http://localhost:5000/api/tickets/${ticket.id}`, {
        status: 'Solved',
        issue: updatedIssue
      });
      loadTickets();
    } catch (err) {
      console.error('Error updating ticket:', err);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (filter === 'All') return true;
    return t.status === filter;
  });

  const pendingCount = tickets.filter((t) => t.status === 'Pending').length;
  const solvedCount = tickets.filter((t) => t.status === 'Solved').length;

  return (
    <div style={{ maxWidth: '950px', margin: '30px auto', fontFamily: 'sans-serif', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '12px' }}>
        <div>
          <h2 style={{ margin: 0 }}>Technician Panel</h2>
          <span style={{ color: '#64748b', fontSize: '14px' }}>Logged in as: <strong>{user.name}</strong> ({user.id})</span>
        </div>
        <button
          onClick={logout}
          style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Logout
        </button>
      </div>

      {notification && (
        <div style={{ marginTop: '15px', padding: '14px 18px', background: '#fef3c7', border: '2px solid #f59e0b', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
          <div style={{ color: '#92400e', fontWeight: 'bold', fontSize: '14px' }}>
            🔔 {notification}
          </div>
          <button
            onClick={() => setNotification('')}
            style={{ background: '#d97706', color: '#fff', border: 'none', borderRadius: '5px', padding: '5px 10px', cursor: 'pointer', fontSize: '12px' }}
          >
            Dismiss
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button
          onClick={() => setFilter('Pending')}
          style={{
            padding: '9px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
            background: filter === 'Pending' ? '#d97706' : '#f1f5f9',
            color: filter === 'Pending' ? '#fff' : '#334155'
          }}
        >
          Pending ({pendingCount})
        </button>

        <button
          onClick={() => setFilter('Solved')}
          style={{
            padding: '9px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
            background: filter === 'Solved' ? '#16a34a' : '#f1f5f9',
            color: filter === 'Solved' ? '#fff' : '#334155'
          }}
        >
          Solved ({solvedCount})
        </button>

        <button
          onClick={() => setFilter('All')}
          style={{
            padding: '9px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
            background: filter === 'All' ? '#2563eb' : '#f1f5f9',
            color: filter === 'All' ? '#fff' : '#334155'
          }}
        >
          All Tickets ({tickets.length})
        </button>
      </div>

      <h3 style={{ marginTop: '20px' }}>{filter} Complain Tickets</h3>
      {filteredTickets.length === 0 ? (
        <p style={{ color: '#64748b', background: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
          এই ক্যাটাগরিতে কোনো টিকেট নেই।
        </p>
      ) : (
        filteredTickets.map((t) => (
          <div
            key={t.id}
            style={{
              border: '1px solid #cbd5e1',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '15px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '15px',
              background: t.status === 'Solved' ? '#f0fdf4' : '#fff'
            }}
          >
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 6px 0' }}>Ticket No: {t.id} — {t.userName} ({t.userId})</h4>

              <div style={{ margin: '8px 0', padding: '8px 12px', background: '#fef2f2', borderLeft: '4px solid #dc2626', borderRadius: '4px', fontSize: '14px' }}>
                <strong>📍 User Location:</strong>{' '}
                <span style={{ color: '#991b1b', fontWeight: 'bold' }}>
                  {t.location || 'Not Provided'}
                </span>
              </div>

              <p style={{ margin: '5px 0' }}><strong>Issue:</strong> {t.issue}</p>
              <p style={{ margin: '5px 0', color: '#2563eb' }}><strong>AI Diagnosis:</strong> {t.aiDiagnosis}</p>
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                Date: {t.date} | Status: <strong>{t.status}</strong>
              </span>

              {t.status === 'Pending' && (
                <div style={{ marginTop: '10px' }}>
                  <input
                    type="text"
                    placeholder="কাজের নোট লিখুন (ঐচ্ছিক)"
                    value={notes[t.id] || ''}
                    onChange={(e) => setNotes({ ...notes, [t.id]: e.target.value })}
                    style={{ width: '100%', maxWidth: '380px', padding: '7px 10px', borderRadius: '5px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              )}
            </div>

            {t.status === 'Pending' ? (
              <button
                onClick={() => markSolved(t)}
                style={{ padding: '10px 18px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' }}
              >
                Mark as Solved
              </button>
            ) : (
              <span style={{ color: '#16a34a', fontWeight: 'bold', whiteSpace: 'nowrap' }}>✓ Completed</span>
            )}
          </div>
        ))
      )}
    </div>
  );
}
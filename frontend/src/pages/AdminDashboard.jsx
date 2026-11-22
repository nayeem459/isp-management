import React, { useEffect, useState } from 'react';
import axios from 'axios';

const fallbackStats = {
  totalUsers: 2,
  monthlyRevenue: '1,800 BDT',
  pendingTickets: 1,
  solvedTickets: 0,
  monthlyGrowth: [
    { month: 'Jun', revenue: 65000 },
    { month: 'Jul', revenue: 74000 },
    { month: 'Aug', revenue: 82000 },
    { month: 'Sep', revenue: 88000 },
    { month: 'Oct', revenue: 96000 },
    { month: 'Nov', revenue: 105000 }
  ],
  customers: [
    {
      id: 'USR-101',
      name: 'Rahim Uddin',
      package: '20 Mbps Super Fast',
      bill_amount: '1000 BDT',
      bill_status: 'Paid',
      expire_date: '2026-12-05'
    },
    {
      id: 'USR-102',
      name: 'Karim Mia',
      package: '15 Mbps Standard',
      bill_amount: '800 BDT',
      bill_status: 'Unpaid',
      expire_date: '2026-11-28'
    }
  ]
};

export default function AdminDashboard({ user, logout }) {
  const [stats, setStats] = useState(fallbackStats);
  const [tickets, setTickets] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  const [uploadMsg, setUploadMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // New Customer Form State
  const [newId, setNewId] = useState('');
  const [newPassword, setNewPassword] = useState('123');
  const [newName, setNewName] = useState('');
  const [newPackage, setNewPackage] = useState('Home 20 Mbps');
  const [newBill, setNewBill] = useState('800 BDT');
  const [newBillStatus, setNewBillStatus] = useState('Unpaid');
  const [newExpire, setNewExpire] = useState('2026-12-21');
  const [addCustomerMsg, setAddCustomerMsg] = useState('');

  const fetchData = async () => {
    try {
      const statRes = await axios.get('http://localhost:5000/api/admin/stats', { timeout: 4000 });
      if (statRes && statRes.data) {
        setStats({
          ...fallbackStats,
          ...statRes.data,
          monthlyGrowth: Array.isArray(statRes.data.monthlyGrowth)
            ? statRes.data.monthlyGrowth
            : fallbackStats.monthlyGrowth,
          customers: Array.isArray(statRes.data.customers)
            ? statRes.data.customers
            : fallbackStats.customers
        });
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    }

    try {
      const ticketRes = await axios.get('http://localhost:5000/api/tickets', { timeout: 4000 });
      setTickets(Array.isArray(ticketRes.data) ? ticketRes.data : []);
    } catch (err) {
      console.error('Error fetching tickets:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    setAddCustomerMsg('');
    try {
      const res = await axios.post('http://localhost:5000/api/customers', {
        id: newId,
        password: newPassword,
        name: newName,
        packageName: newPackage,
        billAmount: newBill,
        billStatus: newBillStatus,
        expireDate: newExpire
      });
      setAddCustomerMsg(res.data.message || 'কাস্টমার যুক্ত হয়েছে');
      setNewId('');
      setNewName('');
      fetchData();
    } catch (err) {
      setAddCustomerMsg(err.response?.data?.message || 'কাস্টমার যুক্ত করা যায়নি!');
    }
  };

  const handleCsvUpload = async (e) => {
    e.preventDefault();
    if (!csvFile) return;
    const formData = new FormData();
    formData.append('file', csvFile);

    try {
      const res = await axios.post('http://localhost:5000/api/customers/import-csv', formData);
      setUploadMsg(res.data.message || 'CSV সিঙ্ক সফল হয়েছে');
      setCsvFile(null);
      fetchData();
    } catch (err) {
      setUploadMsg(err.response?.data?.message || 'ফাইল আপলোড ব্যর্থ হয়েছে!');
    }
  };

  const toggleBillStatus = async (customer) => {
    const nextStatus = customer.bill_status === 'Paid' ? 'Unpaid' : 'Paid';
    const nextExpireDate = nextStatus === 'Paid' ? '2026-12-21' : customer.expire_date;
    try {
      await axios.put(`http://localhost:5000/api/customers/${customer.id}/bill`, {
        billStatus: nextStatus,
        expireDate: nextExpireDate
      });
      fetchData();
    } catch (err) {
      console.error('Error updating bill:', err);
    }
  };

  const filteredCustomers = (stats?.customers || []).filter(
    (c) =>
      String(c.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(c.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1080px', margin: '30px auto', fontFamily: 'sans-serif', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '12px' }}>
        <div>
          <h2 style={{ margin: 0 }}>ISP Admin Control Panel</h2>
          <span style={{ color: '#64748b', fontSize: '14px' }}>
            Logged in as: <strong>{user?.name || 'Admin'}</strong> ({user?.id || 'ADMIN-01'})
          </span>
        </div>
        <button
          onClick={logout}
          style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Logout
        </button>
      </div>

      {/* Business Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '15px', marginTop: '20px' }}>
        <div style={{ padding: '20px', background: '#dbeafe', borderRadius: '10px' }}>
          <h4 style={{ marginTop: 0 }}>Total Active Users</h4>
          <h2 style={{ margin: 0 }}>{stats.totalUsers}</h2>
        </div>
        <div style={{ padding: '20px', background: '#dcfce7', borderRadius: '10px' }}>
          <h4 style={{ marginTop: 0 }}>Monthly Revenue</h4>
          <h2 style={{ margin: 0 }}>{stats.monthlyRevenue}</h2>
        </div>
        <div style={{ padding: '20px', background: '#fef3c7', borderRadius: '10px' }}>
          <h4 style={{ marginTop: 0 }}>Pending Works</h4>
          <h2 style={{ margin: 0 }}>{stats.pendingTickets}</h2>
        </div>
        <div style={{ padding: '20px', background: '#f3e8ff', borderRadius: '10px' }}>
          <h4 style={{ marginTop: 0 }}>Solved Tickets</h4>
          <h2 style={{ margin: 0 }}>{stats.solvedTickets}</h2>
        </div>
      </div>

      {/* Add New Customer Form */}
      <div style={{ marginTop: '25px', padding: '20px', border: '1px solid #cbd5e1', borderRadius: '10px', background: '#f8fafc' }}>
        <h3 style={{ marginTop: 0, color: '#0f172a' }}>Add New Customer</h3>
        <form onSubmit={handleAddCustomer} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>User ID *</label>
            <input
              type="text"
              placeholder="যেমন: USR-105"
              value={newId}
              onChange={(e) => setNewId(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '5px', border: '1px solid #cbd5e1' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Password *</label>
            <input
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '5px', border: '1px solid #cbd5e1' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Customer Name *</label>
            <input
              type="text"
              placeholder="নাম লিখুন"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '5px', border: '1px solid #cbd5e1' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Package</label>
            <input
              type="text"
              value={newPackage}
              onChange={(e) => setNewPackage(e.target.value)}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '5px', border: '1px solid #cbd5e1' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Bill Amount</label>
            <input
              type="text"
              value={newBill}
              onChange={(e) => setNewBill(e.target.value)}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '5px', border: '1px solid #cbd5e1' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Bill Status</label>
            <select
              value={newBillStatus}
              onChange={(e) => setNewBillStatus(e.target.value)}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '5px', border: '1px solid #cbd5e1' }}
            >
              <option value="Unpaid">Unpaid</option>
              <option value="Paid">Paid</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Expire Date</label>
            <input
              type="date"
              value={newExpire}
              onChange={(e) => setNewExpire(e.target.value)}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '5px', border: '1px solid #cbd5e1' }}
            />
          </div>
          <div>
            <button
              type="submit"
              style={{ width: '100%', padding: '9px 14px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              + Add User
            </button>
          </div>
        </form>
        {addCustomerMsg && (
          <p style={{ color: '#0f766e', fontWeight: 'bold', marginTop: '10px', marginBottom: 0 }}>
            ✓ {addCustomerMsg}
          </p>
        )}
      </div>

      {/* CSV Sync from Existing Software */}
      <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #93c5fd', borderRadius: '10px', background: '#eff6ff' }}>
        <h3 style={{ marginTop: 0, color: '#1e40af' }}>Sync Customer Data (CSV Import)</h3>
        <p style={{ fontSize: '14px', color: '#334155', marginTop: 0 }}>
          আগের সফটওয়্যার থেকে এক্সপোর্ট করা <strong>.csv</strong> ফাইল আপলোড করলে ইউজারদের তথ্য, বিল ও এক্সপায়ার ডেট আপডেট হবে।
        </p>
        <form onSubmit={handleCsvUpload} style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setCsvFile(e.target.files[0])}
            required
          />
          <button
            type="submit"
            style={{ padding: '10px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Upload & Sync Users
          </button>
        </form>
        {uploadMsg && <p style={{ color: '#059669', fontWeight: 'bold', marginTop: '10px' }}>✓ {uploadMsg}</p>}
      </div>

      {/* Business Growth Bar Graph */}
      <div style={{ marginTop: '25px', padding: '20px', border: '1px solid #e2e8f0', borderRadius: '10px', background: '#fff' }}>
        <h3 style={{ marginTop: 0 }}>Monthly Revenue Growth Graph</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '25px', height: '180px', paddingTop: '20px', borderBottom: '2px solid #334155' }}>
          {(stats.monthlyGrowth || []).map((item) => (
            <div key={item.month} style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '12px', marginBottom: '5px', fontWeight: 'bold' }}>{item.revenue}৳</div>
              <div
                style={{
                  height: `${Math.min((Number(item.revenue || 0) / 130000) * 140, 140)}px`,
                  background: '#2563eb',
                  borderRadius: '6px 6px 0 0'
                }}
              />
              <div style={{ marginTop: '8px', fontWeight: 'bold' }}>{item.month}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer List & Bill Status */}
      <div style={{ marginTop: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0 }}>Customers & Bill Status</h3>
          <input
            type="text"
            placeholder="Search by User ID or Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', minWidth: '240px' }}
          />
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>User ID</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Name</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Package</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Bill</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Expire Date</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '14px', textAlign: 'center', border: '1px solid #ddd', color: '#64748b' }}>
                  কোনো কাস্টমার পাওয়া যায়নি।
                </td>
              </tr>
            ) : (
              filteredCustomers.map((c) => (
                <tr key={c.id}>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{c.id}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{c.name}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{c.package}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold', color: c.bill_status === 'Paid' ? '#059669' : '#dc2626' }}>
                    {c.bill_amount} ({c.bill_status})
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{c.expire_date}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    <button
                      onClick={() => toggleBillStatus(c)}
                      style={{ padding: '6px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      Toggle Paid/Unpaid
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* All User Complains & Pending Tasks */}
      <div style={{ marginTop: '30px' }}>
        <h3>All User Complains & Ticket Status</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Ticket No</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>User</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Location</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Issue</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id}>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{t.id}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{t.userName} ({t.userId})</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{t.location}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{t.issue}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold', color: t.status === 'Pending' ? '#d97706' : '#059669' }}>
                  {t.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
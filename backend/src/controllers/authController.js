const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'isp_management_secret_key_2026';

const demoUsers = [
  {
    id: 'USR-101',
    name: 'Rahim Uddin',
    password: '123',
    role: 'user',
    package: '20 Mbps Super Fast',
    billAmount: '1000 BDT',
    billStatus: 'Paid',
    expireDate: '2026-12-05',
    downloadSpeed: '19.4 Mbps',
    uploadSpeed: '18.1 Mbps'
  },
  {
    id: 'ADMIN-01',
    name: 'System Admin',
    password: '123',
    role: 'admin'
  },
  {
    id: 'TECH-01',
    name: 'Kamal (Technician)',
    password: '123',
    role: 'technician'
  }
];

function formatUser(dbUser) {
  return {
    id: dbUser.id,
    name: dbUser.name,
    role: dbUser.role,
    package: dbUser.package || '20 Mbps Super Fast',
    billAmount: dbUser.bill_amount ?? dbUser.billAmount ?? '1000 BDT',
    billStatus: dbUser.bill_status ?? dbUser.billStatus ?? 'Paid',
    expireDate: dbUser.expire_date ?? dbUser.expireDate ?? '2026-12-21',
    downloadSpeed: dbUser.download_speed ?? dbUser.downloadSpeed ?? '19.4 Mbps',
    uploadSpeed: dbUser.upload_speed ?? dbUser.uploadSpeed ?? '18.1 Mbps'
  };
}

exports.login = async (req, res) => {
  try {
    const body = req.body || {};
    const rawId = body.id ?? body.userId ?? body.username ?? '';
    const rawPassword = body.password ?? '';
    const cleanId = String(rawId).trim();
    const cleanPassword = String(rawPassword).trim();

    if (!cleanId || !cleanPassword) {
      return res.status(400).json({ message: 'User ID এবং Password দুটিই দেওয়া আবশ্যক।' });
    }

    // ১. প্রথমে MySQL ডাটাবেসে চেক করা হবে
    try {
      const pool = require('../config/db');
      const [rows] = await pool.query(
        'SELECT * FROM users WHERE UPPER(TRIM(id)) = UPPER(?) AND password = ?',
        [cleanId, cleanPassword]
      );

      if (Array.isArray(rows) && rows.length > 0) {
        const user = formatUser(rows[0]);
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
        return res.json({ token, user });
      }
    } catch (dbErr) {
      console.warn('MySQL login fallback to demoUsers:', dbErr.message);
    }

    // ২. MySQL-এ না পাওয়া গেলে ডেমো ইউজার লিস্ট থেকে চেক করা হবে
    const matchedDemo = demoUsers.find(
      (u) => u.id.toUpperCase() === cleanId.toUpperCase() && String(u.password) === cleanPassword
    );

    if (!matchedDemo) {
      return res.status(401).json({ message: 'লগইন করা যায়নি। সঠিক ID এবং Password দিন।' });
    }

    const user = formatUser(matchedDemo);
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    return res.json({ token, user });
  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const cleanId = String(req.params.id || '').trim();

    try {
      const pool = require('../config/db');
      const [rows] = await pool.query('SELECT * FROM users WHERE UPPER(TRIM(id)) = UPPER(?)', [cleanId]);
      if (Array.isArray(rows) && rows.length > 0) {
        return res.json(formatUser(rows[0]));
      }
    } catch (dbErr) {
      console.warn('Profile MySQL fallback:', dbErr.message);
    }

    const demoMatch = demoUsers.find((u) => u.id.toUpperCase() === cleanId.toUpperCase());
    if (!demoMatch) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(formatUser(demoMatch));
  } catch (err) {
    console.error('Profile Error:', err);
    return res.status(500).json({ message: 'Error fetching user profile' });
  }
};
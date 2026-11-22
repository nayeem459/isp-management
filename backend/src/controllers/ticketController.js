const db = require('../config/db');

let memoryTickets = [
  {
    id: 'TKT-501',
    userId: 'USR-101',
    userName: 'Rahim Uddin',
    location: 'Savar, Dhaka',
    issue: 'Red LOS light blinking on ONU',
    aiDiagnosis: 'Optical fiber cable cut or loose patch cord detected.',
    status: 'Pending',
    assignedTech: 'TECH-01',
    date: '2026-11-21'
  }
];

let memoryCustomers = [
  {
    id: 'USR-101',
    name: 'Rahim Uddin',
    password: '123',
    role: 'user',
    package: '20 Mbps Super Fast',
    bill_amount: '1000 BDT',
    bill_status: 'Paid',
    expire_date: '2026-12-05',
    download_speed: '19.4 Mbps',
    upload_speed: '18.1 Mbps'
  },
  {
    id: 'USR-102',
    name: 'Karim Mia',
    password: '123',
    role: 'user',
    package: '15 Mbps Standard',
    bill_amount: '800 BDT',
    bill_status: 'Unpaid',
    expire_date: '2026-11-28',
    download_speed: '14.2 Mbps',
    upload_speed: '12.8 Mbps'
  }
];

function normalizeTicket(t) {
  return {
    id: t.id,
    userId: t.userId ?? t.user_id ?? 'USR-101',
    userName: t.userName ?? t.user_name ?? 'Customer',
    location: t.location || 'Dhaka',
    issue: t.issue || t.problem || 'Network Issue',
    aiDiagnosis: t.aiDiagnosis ?? t.ai_diagnosis ?? 'Check ONU & optical fiber connection.',
    status: t.status || 'Pending',
    assignedTech: t.assignedTech ?? t.assigned_tech ?? 'TECH-01',
    date: t.date || t.created_at || new Date().toISOString().slice(0, 10)
  };
}

exports.getAllTickets = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM tickets ORDER BY id DESC');
    if (Array.isArray(rows) && rows.length > 0) {
      return res.json(rows.map(normalizeTicket));
    }
    return res.json(memoryTickets.map(normalizeTicket));
  } catch (err) {
    console.warn('getAllTickets fallback to memoryTickets:', err.message);
    return res.json(memoryTickets.map(normalizeTicket));
  }
};

exports.createTicket = async (req, res) => {
  try {
    const body = req.body || {};
    const newId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date().toISOString().slice(0, 10);

    const ticketData = normalizeTicket({
      id: newId,
      userId: body.userId || body.user_id || 'USR-101',
      userName: body.userName || body.user_name || 'Rahim Uddin',
      location: body.location || body.address || 'Ashulia, Dhaka',
      issue: body.issue || body.problem || body.symptom || 'Internet / ONU Issue',
      aiDiagnosis: body.aiDiagnosis || body.ai_diagnosis || body.diagnosis || 'AI diagnostic check recommended.',
      status: 'Pending',
      assignedTech: body.assignedTech || 'TECH-01',
      date: today
    });

    try {
      await db.query(
        `INSERT INTO tickets (id, user_id, user_name, location, issue, ai_diagnosis, status, assigned_tech, date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          ticketData.id,
          ticketData.userId,
          ticketData.userName,
          ticketData.location,
          ticketData.issue,
          ticketData.aiDiagnosis,
          ticketData.status,
          ticketData.assignedTech,
          ticketData.date
        ]
      );
    } catch (dbErr) {
      console.warn('createTicket MySQL fallback to memoryTickets:', dbErr.message);
    }

    memoryTickets = [ticketData, ...memoryTickets];

    return res.status(201).json({
      message: 'Complain ticket সফলভাবে তৈরি হয়েছে!',
      ticket: ticketData,
      ...ticketData
    });
  } catch (err) {
    console.error('Create Ticket Error:', err);
    return res.status(500).json({ message: 'টিকেটে পাঠাতে সমস্যা হয়েছে!' });
  }
};

const handleTicketUpdate = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const nextStatus = req.body.status || 'Resolved';

    try {
      await db.query('UPDATE tickets SET status = ? WHERE id = ?', [nextStatus, ticketId]);
    } catch (dbErr) {
      console.warn('updateTicket MySQL fallback:', dbErr.message);
    }

    memoryTickets = memoryTickets.map((t) =>
      t.id === ticketId ? { ...t, status: nextStatus } : t
    );

    const updated = memoryTickets.find((t) => t.id === ticketId) || {
      id: ticketId,
      status: nextStatus
    };

    return res.json({
      message: 'Ticket status updated!',
      ticket: updated
    });
  } catch (err) {
    console.error('Update Ticket Error:', err);
    return res.status(500).json({ message: 'টিকেট আপডেট করতে সমস্যা হয়েছে!' });
  }
};

exports.updateTicket = handleTicketUpdate;
exports.updateTicketStatus = handleTicketUpdate;

exports.createCustomer = async (req, res) => {
  try {
    const body = req.body || {};
    const id = String(body.id || '').trim();
    const password = String(body.password || '123').trim();
    const name = String(body.name || '').trim();
    const pkg = body.packageName || body.package || 'Home 20 Mbps';
    const billAmount = body.billAmount || '800 BDT';
    const billStatus = body.billStatus || 'Unpaid';
    const expireDate = body.expireDate || '2026-12-21';

    if (!id || !name) {
      return res.status(400).json({ message: 'User ID এবং Name আবশ্যক।' });
    }

    const newCustomer = {
      id,
      name,
      password,
      role: 'user',
      package: pkg,
      bill_amount: billAmount,
      bill_status: billStatus,
      expire_date: expireDate,
      download_speed: '20.0 Mbps',
      upload_speed: '18.0 Mbps'
    };

    try {
      await db.query(
        `INSERT INTO users (id, name, password, role, package, bill_amount, bill_status, expire_date, download_speed, upload_speed)
         VALUES (?, ?, ?, 'user', ?, ?, ?, ?, '20.0 Mbps', '18.0 Mbps')`,
        [id, name, password, pkg, billAmount, billStatus, expireDate]
      );
    } catch (dbErr) {
      console.warn('createCustomer MySQL fallback:', dbErr.message);
    }

    memoryCustomers = [newCustomer, ...memoryCustomers.filter((c) => c.id !== id)];

    return res.status(201).json({
      message: 'নতুন কাস্টমার সফলভাবে যুক্ত হয়েছে!',
      customer: newCustomer
    });
  } catch (err) {
    console.error('Create Customer Error:', err);
    return res.status(500).json({ message: 'কাস্টমার যুক্ত করা যায়নি!' });
  }
};
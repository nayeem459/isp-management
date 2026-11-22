// ডেমো ডাটাবেস (Users এবং Tickets)
const users = [
  {
    id: "USR-101",
    name: "Rahim Uddin",
    password: "123",
    role: "user",
    package: "20 Mbps Super Fast",
    billAmount: "1000 BDT",
    billStatus: "Paid",
    expireDate: "2026-12-05",
    downloadSpeed: "19.4 Mbps",
    uploadSpeed: "18.1 Mbps"
  },
  {
    id: "ADMIN-01",
    name: "System Admin",
    password: "123",
    role: "admin"
  },
  {
    id: "TECH-01",
    name: "Kamal (Technician)",
    password: "123",
    role: "technician"
  }
];

const tickets = [
  {
    id: "TKT-501",
    userId: "USR-101",
    userName: "Rahim Uddin",
    issue: "Red LOS light blinking on ONU",
    aiDiagnosis: "Optical fiber cable cut or loose patch cord detected.",
    status: "Pending",
    assignedTech: "TECH-01",
    date: "2026-11-21"
  }
];

module.exports = { users, tickets };
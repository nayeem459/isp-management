const db = require('../config/db');

exports.payBill = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("UPDATE users SET billStatus = 'Paid' WHERE id = ?", [id]);
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);

    if (!rows.length) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'আপনার বিল সফলভাবে Paid হিসেবে আপডেট হয়েছে!',
      user: rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Bill payment update failed' });
  }
};

exports.updateSpeed = async (req, res) => {
  try {
    const { id } = req.params;
    const { downloadSpeed, uploadSpeed } = req.body;

    await db.query(
      'UPDATE users SET downloadSpeed = ?, uploadSpeed = ? WHERE id = ?',
      [downloadSpeed, uploadSpeed, id]
    );
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);

    res.json({
      message: 'Speed updated',
      user: rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Speed update failed' });
  }
};
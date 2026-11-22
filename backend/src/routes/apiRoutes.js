const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const authController = require('../controllers/authController');
const aiController = require('../controllers/aiController');
const ticketController = require('../controllers/ticketController');
const adminController = require('../controllers/adminController');
const userController = require('../controllers/userController');

// Auth
router.post('/login', authController.login);

// AI Troubleshooter
router.post('/ai/diagnose', aiController.diagnoseProblem);

// Tickets
router.get('/tickets', ticketController.getAllTickets);
router.post('/tickets', ticketController.createTicket);
router.put('/tickets/:id', ticketController.updateTicket);

// Admin & Customers
router.get('/admin/stats', adminController.getStats);
router.post('/customers', ticketController.createCustomer);
router.post('/customers/import-csv', upload.single('file'), adminController.importCsv);
router.put('/customers/:id/bill', adminController.updateBill);

// User Actions
router.post('/user/:id/pay-bill', userController.payBill);
router.put('/user/:id/speed', userController.updateSpeed);

module.exports = router;
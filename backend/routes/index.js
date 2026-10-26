const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const requestController = require('../controllers/requestController');
const adminController = require('../controllers/adminController');
const { auth } = require('../middleware/auth');

// Auth Routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// Request Routes
// Create Request (Optional auth: anyone can create, but auth users get it linked to them)
router.post('/requests', auth(true), requestController.createRequest);

// Get Requests (Requires auth to filter properly by role)
router.get('/requests', auth(), requestController.getRequests);

// Get requests assigned to current donor
router.get('/requests/my', auth(), requestController.getMyRequests);

// Admin Verify Request
router.put('/requests/:id/verify', auth(), requestController.verifyRequest);

// Donor Accept Request
router.put('/requests/:id/accept', auth(), requestController.acceptRequest);

// Complete Request (Donor or Admin)
router.put('/requests/:id/complete', auth(), requestController.completeRequest);

// Twilio SMS Webhook (No auth required for incoming SMS)
router.post('/twilio/webhook', requestController.handleTwilioSms);

// Admin Routes
router.get('/admin/dashboard', auth(), adminController.getDashboardStats);

module.exports = router;

const Request = require('../models/Request');
const Donation = require('../models/Donation');
const twilio = require('twilio');

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_FROM_NUMBER,
  TWILIO_REQUEST_NUMBER,
  MY_TWILIO_NUMBER,
} = process.env;

const activeTwilioNumber = TWILIO_FROM_NUMBER || MY_TWILIO_NUMBER;

const twilioClient = (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN)
  ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
  : null;

const sendTwilioMessage = async ({ to, body }) => {
  if (!twilioClient || !activeTwilioNumber || !to) {
    throw new Error('Twilio is not configured properly.');
  }
  return twilioClient.messages.create({
    from: activeTwilioNumber,
    to,
    body,
  });
};

exports.createRequest = async (req, res) => {
  try {
    const { phone, name, smsText, category, description, location, urgency, sendViaTwilio } = req.body;
    let requestData = { phone, name, urgency: urgency || 'High' };

    if (smsText) {
      return res.status(400).json({ message: 'SMS simulation is no longer supported. Use the web form or Twilio SMS option.' });
    }

    if (!category || !description || !location) {
      return res.status(400).json({ message: 'Category, description, and location are required.' });
    }

    requestData = { ...requestData, category, description, location };

    if (req.user) {
      requestData.createdBy = req.user.id;
      requestData.createdByRole = req.user.role;
      if (req.user.role === 'Admin') {
        requestData.status = 'Verified'; // Auto-verify admin requests
      }
    } else {
      requestData.createdByRole = 'Needy';
    }

    if (sendViaTwilio) {
      if (!TWILIO_REQUEST_NUMBER) {
        return res.status(500).json({ message: 'Twilio request number is not configured on the server.' });
      }

      const smsBody = `New Help Request\nName: ${name || 'Unknown'}\nPhone: ${phone}\nCategory: ${category}\nUrgency: ${requestData.urgency}\nLocation: ${location}\nDetails: ${description}`;

      try {
        await sendTwilioMessage({ to: TWILIO_REQUEST_NUMBER, body: smsBody });
      } catch (err) {
        console.error('Twilio SMS send error:', err);
        return res.status(500).json({ message: 'Unable to send request via Twilio SMS.' });
      }
    }

    const newRequest = new Request(requestData);
    await newRequest.save();

    res.status(201).json({ message: sendViaTwilio ? 'Request created and SMS sent via Twilio.' : 'Request created successfully', request: newRequest });
  } catch (error) {
    console.error('Create Request Error:', error);
    res.status(500).json({ message: 'Server error while creating request', error: error.message });
  }
};

exports.getRequests = async (req, res) => {
  try {
    const { role } = req.user || {};
    let query = {};

    // Donors see verified, accepted, and completed requests
    if (role === 'Donor') {
      query.status = { $in: ['Verified', 'Accepted', 'Completed'] };
    } else if (role === 'Needy') {
      // Needy can only see their own requests
      query.createdBy = req.user.id;
    }

    // Sort by Urgency (High first), then by date
    const urgencyMap = { 'High': 1, 'Medium': 2, 'Low': 3 };
    
    let requests = await Request.find(query)
      .populate('createdBy', 'name phone')
      .populate('assignedDonor', 'name phone')
      .sort({ createdAt: -1 });

    // Custom sort for urgency
    requests.sort((a, b) => urgencyMap[a.urgency] - urgencyMap[b.urgency]);

    res.json(requests);
  } catch (error) {
    console.error('Get Requests Error:', error);
    res.status(500).json({ message: 'Server error fetching requests' });
  }
};

exports.getMyRequests = async (req, res) => {
  try {
    if (req.user.role !== 'Donor') {
      return res.status(403).json({ message: 'Only Donors can view their assigned requests' });
    }

    const requests = await Request.find({ assignedDonor: req.user.id })
      .populate('createdBy', 'name phone')
      .populate('assignedDonor', 'name phone')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Get My Requests Error:', error);
    res.status(500).json({ message: 'Server error fetching donor requests' });
  }
};

exports.verifyRequest = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Only Admin can verify requests' });
    }

    const request = await Request.findByIdAndUpdate(req.params.id, { status: 'Verified' }, { new: true });
    if (!request) return res.status(404).json({ message: 'Request not found' });

    res.json({ message: 'Request verified', request });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.acceptRequest = async (req, res) => {
  try {
    if (req.user.role !== 'Donor') {
      return res.status(403).json({ message: 'Only Donors can accept requests' });
    }

    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'Verified') return res.status(400).json({ message: 'Request is not verified or already accepted' });

    request.status = 'Accepted';
    request.assignedDonor = req.user.id;
    await request.save();

    const donation = new Donation({
      requestId: request._id,
      donorId: req.user.id,
      status: 'Accepted'
    });
    await donation.save();

    res.json({ message: 'Request accepted', request });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.completeRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    // Ensure only assigned donor or admin can complete
    if (req.user.role !== 'Admin' && request.assignedDonor?.toString() !== req.user.id) {
       return res.status(403).json({ message: 'Not authorized to complete this request' });
    }

    request.status = 'Completed';
    await request.save();

    await Donation.findOneAndUpdate(
      { requestId: request._id },
      { status: 'Completed', completedAt: new Date() }
    );

    res.json({ message: 'Request completed', request });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper to parse incoming SMS for request creation
// Format: HELP <CATEGORY> <DESCRIPTION> <LOCATION>
// Example: HELP FOOD 3 PEOPLE CHENNAI
const parseIncomingSms = (smsText) => {
  const parts = smsText.trim().toUpperCase().split(/\s+/);
  if (parts[0] !== 'HELP' || parts.length < 4) {
    throw new Error('Invalid format. Send: HELP <CATEGORY> <DESCRIPTION> <LOCATION>');
  }

  const categoryStr = parts[1];
  let category = 'Emergency';
  if (categoryStr.includes('FOOD')) category = 'Food';
  else if (categoryStr.includes('MED')) category = 'Medical';
  else if (categoryStr.includes('CLOTH')) category = 'Clothes';

  // Last part is location, middle parts are description
  const location = parts[parts.length - 1];
  const description = parts.slice(2, parts.length - 1).join(' ');

  return { category, description, location };
};

// Simple Twilio webhook validation (in production, use proper signature validation)
const validateTwilioRequest = (req) => {
  // In production, you should validate the X-Twilio-Signature header
  // For now, we'll just check if required fields are present
  return req.body && req.body.From && req.body.Body;
};

exports.handleTwilioSms = async (req, res) => {
  try {
    // Basic validation
    if (!validateTwilioRequest(req)) {
      console.log('Invalid Twilio request');
      return res.status(400).send('<Response></Response>');
    }

    const { From: phone, Body: smsText } = req.body;

    console.log('Incoming SMS:', { phone, smsText });

    let requestData;
    try {
      requestData = parseIncomingSms(smsText);
    } catch (err) {
      // Send error response back via SMS
      const errorMessage = err.message;
      if (twilioClient && TWILIO_FROM_NUMBER) {
        try {
          await sendTwilioMessage({ to: phone, body: errorMessage });
        } catch (smsErr) {
          console.error('Failed to send error SMS:', smsErr);
        }
      }
      return res.status(400).send('<Response></Response>');
    }

    // Create the request
    requestData.phone = phone;
    requestData.urgency = 'High'; // SMS requests are urgent by default
    requestData.createdByRole = 'Needy';

    const newRequest = new Request(requestData);
    await newRequest.save();

    // Send confirmation SMS back
    const confirmationMessage = `Request received! Category: ${requestData.category}, Location: ${requestData.location}. We'll connect you with help soon.`;
    if (twilioClient && TWILIO_FROM_NUMBER) {
      try {
        await sendTwilioMessage({ to: phone, body: confirmationMessage });
      } catch (smsErr) {
        console.error('Failed to send confirmation SMS:', smsErr);
      }
    }

    // Return empty TwiML response to Twilio
    res.set('Content-Type', 'text/xml');
    res.send('<Response></Response>');

  } catch (error) {
    console.error('Twilio SMS Handler Error:', error);
    res.status(500).send('<Response></Response>');
  }
};

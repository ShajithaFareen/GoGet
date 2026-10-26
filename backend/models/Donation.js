const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Accepted', 'Completed'], default: 'Accepted' },
  completedAt: { type: Date }
});

module.exports = mongoose.model('Donation', donationSchema);

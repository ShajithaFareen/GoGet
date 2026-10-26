const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdByRole: { type: String, enum: ['Admin', 'Donor', 'Volunteer', 'Needy'] },
  phone: { type: String, required: true },
  name: { type: String }, // Optional
  category: { type: String, enum: ['Food', 'Medical', 'Clothes', 'Emergency'], required: true },
  description: { type: String },
  location: { type: String, required: true },
  urgency: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  status: { type: String, enum: ['Pending', 'Verified', 'Accepted', 'Completed'], default: 'Pending' },
  assignedDonor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Request', requestSchema);

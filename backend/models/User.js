const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: false }, // Optional per requirements
  email: { type: String, required: false },
  password: { type: String, required: false }, // Needed for login roles
  role: { 
    type: String, 
    enum: ['Admin', 'Donor', 'Volunteer', 'Needy'], 
    default: 'Needy' 
  },
  phone: { type: String, required: true, unique: true }, // SMS module needs phone tracking
  location: { type: String, required: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);

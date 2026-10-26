const mongoose = require('mongoose');
require('dotenv').config();
const Request = require('./models/Request');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/goget';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    try {
      const newRequest = new Request({
        phone: '1234567890',
        name: 'Test Needy',
        location: 'Chennai',
        category: 'Food',
        description: 'Need food',
        urgency: 'High',
        createdByRole: 'Needy'
      });
      await newRequest.save();
      console.log('Saved successfully');
    } catch (err) {
      console.error('Save Error:', err);
    }
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Connection Error:', err);
  });

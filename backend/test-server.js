require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes');

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/goget')
  .then(() => console.log('Test Server: MongoDB Connected'))
  .catch(err => console.error(err));

app.use('/api', routes);

const server = app.listen(5001, () => {
  console.log('Test server running on port 5001');
  
  // Make a request to ourselves
  fetch('http://localhost:5001/api/requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: '1234567890',
      name: 'Test',
      location: 'Chennai',
      category: 'Food',
      description: 'Test',
      urgency: 'High'
    })
  })
  .then(res => res.json().then(data => ({status: res.status, data})))
  .then(res => {
    console.log('Response:', res);
    server.close();
    process.exit(0);
  })
  .catch(err => {
    console.error('Fetch Error:', err);
    server.close();
    process.exit(1);
  });
});

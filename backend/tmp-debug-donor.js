const mongoose = require('mongoose');
const User = require('./models/User');
const Request = require('./models/Request');

mongoose.connect('mongodb://localhost:27017/goget').then(async () => {
  const donors = await User.find({ role: 'Donor' }).lean();
  console.log('Donor users:', JSON.stringify(donors, null, 2));
  const accepted = await Request.find({ status: 'Accepted' }).limit(20).lean();
  console.log('Accepted requests count:', accepted.length);
  console.log(JSON.stringify(accepted, null, 2));
  mongoose.connection.close();
}).catch(e => {
  console.error(e);
  process.exit(1);
});
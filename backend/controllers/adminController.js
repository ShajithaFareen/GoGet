const User = require('../models/User');
const Request = require('../models/Request');

exports.getDashboardStats = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Forbidden: Admins only' });
    }

    const totalRequests = await Request.countDocuments();
    const pendingRequests = await Request.countDocuments({ status: 'Pending' });
    const completedRequests = await Request.countDocuments({ status: 'Completed' });
    const activeDonors = await User.countDocuments({ role: 'Donor' });

    res.json({
      totalRequests,
      pendingRequests,
      completedRequests,
      activeDonors
    });
  } catch (error) {
    console.error('Admin Dashboard Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

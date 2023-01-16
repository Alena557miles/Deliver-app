const User = require('../models/User');

async function isUserDriver(req, res, next) {
  // eslint-disable-next-line no-underscore-dangle
  const findUser = await User.findById(req.user._id);
  if (findUser.role === 'DRIVER') {
    return next();
  }
  return res.status(400).json({ message: 'this options is for DRIVERS only' });
}

async function isUserShipper(req, res, next) {
  // eslint-disable-next-line no-underscore-dangle
  const findUser = await User.findById(req.user._id);
  if (findUser.role === 'SHIPPER') {
    return next();
  }
  return res.status(400).json({ message: 'this options is for SHIPPERS only' });
}

module.exports = {
  isUserDriver,
  isUserShipper,
};

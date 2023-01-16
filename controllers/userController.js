/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function getUser(req, res) {
  try {
    // eslint-disable-next-line no-underscore-dangle
    const user = await User.findById({ _id: req.user._id });
    if (!user) {
      return res.status(400).json({ message: 'not found' });
    }
    const {
      _id, email, role, createdDate,
    } = user;
    return res.status(200).render('me', { title: 'ME', user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function deleteUser(req, res) {
  try {
    // eslint-disable-next-line no-underscore-dangle
    const deletedUser = await User.findByIdAndDelete({ _id: req.user._id });
    if (!deletedUser) {
      return res.status(400).json({ message: 'not found' });
    }
    return res.status(200).json({ redirect: '/' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function changePassword_get(req, res) {
  res.status(200).render('password', { title: 'CHANGE PASSWORT' });
}

async function changePassword_patch(req, res) {
  try {
    const { oldPassword, newPassword } = req.body;
    console.log(oldPassword, newPassword);
    // eslint-disable-next-line no-underscore-dangle
    const user = await User.findById({ _id: req.user._id });
    const match = await bcrypt.compare(oldPassword, user.password);
    if (match) {
      // hash password
      const hashedPass = await bcrypt.hash(newPassword, 10);
      // eslint-disable-next-line no-underscore-dangle
      const updatedUser = await User.findByIdAndUpdate(req.user._id, { password: hashedPass });
      if (!updatedUser) {
        return res.status(400).json({ message: 'not found' });
      }
      // return res.status(200).json({ message: 'Success' });
      return res.status(200).json({ redirect: '/api/users/me/password' });
    }
    return res.status(400).json({ message: 'passwords not match!' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = {
  getUser,
  deleteUser,
  changePassword_get,
  changePassword_patch,
};

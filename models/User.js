const mongoose = require('mongoose');
const { isEmail } = require('validator');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please, enter an email'],
    unique: true,
    validate: [isEmail, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please, enter an password'],
    minlength: [6, 'Minimum password length is 6 characters'],
  },
  role: {
    type: String,
    enum: ['DRIVER', 'SHIPPER'],
    required: [true, 'Please, choose your role'],
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', userSchema);

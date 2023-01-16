const mongoose = require('mongoose');

const loadSchema = new mongoose.Schema({
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
  },
  assigned_to: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  status: {
    type: String,
    enum: ['NEW', 'POSTED', 'ASSIGNED', 'SHIPPED'],
    default: 'NEW',
  },
  state: {
    type: String,
    enum: [
      'En route to Pick Up',
      'Arrived to Pick Up',
      'En route to delivery',
      'Arrived to delivery',
    ],
  },
  name: {
    type: String,
  },
  payload: {
    type: Number,
    required: true,
  },
  pickup_address: {
    type: String,
    required: true,
  },
  delivery_address: {
    type: String,
    required: true,
  },
  dimensions: {
    width: {
      type: Number,
      required: true,
    },
    length: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
  },
  logs: {
    type: Array,
    message: {
      type: String,
      // default: 'Waiting',
    },
    time: {
      type: Date,
      // default: Date.now,
    },
    default: {
      message: 'Waiting',
      time: Date.now,
    },
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('Load', loadSchema);

const mongoose = require('mongoose');

const truckSchema = new mongoose.Schema({
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
  },
  assigned_to: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  type: {
    type: String,
    enum: ['SPRINTER', 'SMALL STRAIGHT', 'LARGE STRAIGHT'],
    default: 'SPRINTER',
    required: true,
  },
  status: {
    type: String,
    enum: ['OL', 'IS'],
    default: 'IS',
  },
  shipperId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('Truck', truckSchema);

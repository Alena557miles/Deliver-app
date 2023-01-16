/* eslint-disable no-underscore-dangle */
const Truck = require('../models/Truck');
const User = require('../models/User');

async function addTruckForUser(req, res) {
  console.log(req.body);
  const { type } = req.body;
  if (!type) {
    return res.status(400).json({ message: "'type' field required" });
  }
  // eslint-disable-next-line camelcase
  const created_by = req.user._id;
  const truck = new Truck({
    // eslint-disable-next-line camelcase
    created_by,
    type,
  });
  try {
    const newTruck = await truck.save();
    if (!newTruck) {
      return res.status(500).json({ message: 'Failed saving to db' });
    }
    return res.status(200).redirect('/api/trucks');
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function getUserTrucks(req, res) {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    const trucks = await Truck.find({ created_by: userId }, '-__v').sort({ createdAt: -1 });

    res.status(200).render('trucks', { title: 'ALL TRUCKS', trucks, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getUserTruckById(req, res) {
  try {
    const truckId = req.params.id;
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!truckId) {
      return res.status(400).json({ message: 'No id specified' });
    }
    const truck = await Truck.findOne({ userId, _id: truckId });
    return res.status(200).render('truck', { title: 'TRUCK', truck, user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function deleteUserTruckById(req, res) {
  try {
    const truckId = req.params.id;
    if (!truckId) {
      return res.status(400).json({ message: 'No id specified' });
    }
    const truck = await Truck.findById({ _id: truckId });
    if (!truck) {
      return res.status(400).json({ message: 'no such note' });
    }
    await Truck.findByIdAndDelete({ _id: truckId });
    return res.status(200).json({ redirect: '/api/trucks' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function assignTruckToUserById(req, res) {
  try {
    const truckId = req.params.id;
    if (!truckId) {
      return res.status(400).json({ message: 'No id specified' });
    }
    const assign = req.user._id;
    await Truck.findByIdAndUpdate(truckId, { assigned_to: assign });
    return res.status(200).json({ redirect: '/api/trucks/' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function updateUserTruckById(req, res) {
  try {
    const { type } = req.body;
    console.log(req.body);
    if (!type) {
      return res.status(400).json({ message: "'type' field required" });
    }
    const truckId = req.params.id;
    console.log(truckId);
    if (!truckId) {
      return res.status(400).json({ message: 'No id specified' });
    }
    await Truck.findByIdAndUpdate(truckId, { type });
    return res.status(200).json({ redirect: `/api/trucks/${truckId}` });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = {
  addTruckForUser,
  getUserTrucks,
  getUserTruckById,
  deleteUserTruckById,
  assignTruckToUserById,
  updateUserTruckById,
};

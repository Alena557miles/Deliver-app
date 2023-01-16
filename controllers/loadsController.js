/* eslint-disable no-case-declarations */
/* eslint-disable consistent-return */
/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
const Load = require('../models/Load');
const User = require('../models/User');
const Truck = require('../models/Truck');
const {
  SPRINTER,
  SMALL_STRAIGHT,
  LARGE_STRAIGHT,
  getType,
} = require('../trucksType');

async function getUserLoads(req, res) {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (user.role === 'SHIPPER') {
      const loads = await Load.find({ created_by: userId }, '-__v').sort({ createdAt: -1 });
      res.status(200).render('loads', { title: 'ALL LOADS', loads, user });
    } else {
      const loads = await Load.find({ assigned_to: userId }, '-__v').sort({ createdAt: -1 });
      res.status(200).render('loads', { title: 'ALL LOADS', loads, user });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
async function addLoadForUser(req, res) {
  const {
    name, payload, pickup_address, delivery_address, width, length, height,
  } = req.body;
  const created_by = req.user._id;
  const load = new Load({
    // eslint-disable-next-line camelcase
    created_by,
    name,
    payload,
    // eslint-disable-next-line camelcase
    pickup_address,
    // eslint-disable-next-line camelcase
    delivery_address,
    dimensions: {
      width,
      length,
      height,
    },
  });
  try {
    const newLoad = await load.save();
    if (!newLoad) {
      return res.status(500).json({ message: 'Failed saving to db' });
    }
    return res.status(200).redirect('/api/loads');
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}
async function getUserLoadById(req, res) {
  try {
    const loadId = req.params.id;
    const userId = req.user._id;
    const user = await User.findById(userId);
    // console.log(userId)
    if (!loadId) {
      return res.status(400).json({ message: 'No id specified' });
    }
    const load = await Load.findOne({ userId, _id: loadId });
    return res.status(200).render('load', { title: 'LOAD', load, user });
    // return res.status(200).render('load', { title: 'LOAD', load: load });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
async function deleteUserLoadById(req, res) {
  try {
    const loadId = req.params.id;
    if (!loadId) {
      return res.status(400).json({ message: 'No id specified' });
    }
    const load = await Load.findById({ _id: loadId });
    if (!load) {
      return res.status(400).json({ message: 'no such load' });
    }
    const status = load.status ? load.status : undefined;
    // console.log(status)
    if (!status === 'NEW') {
      return res.status(400).json({ message: "You can only delete load with status 'NEW'" });
    }
    await Load.findByIdAndDelete({ _id: loadId });
    return res.status(200).json({ redirect: '/api/loads' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
async function getUserActiveLoad(req, res) {
  try {
    const userId = req.user._id;
    const driver = await User.findById({ _id: userId });
    if (!driver) {
      return res.status(400).json({ message: 'DRIVER not found' });
    }

    const loads = await Load.findOne({ assigned_to: userId, status: { $ne: 'SHIPPED' } });
    if (!loads) {
      return res.status(400).json({ message: 'loads not found' });
      // res.status(200).render('loads', { title: 'ACTIVE LOAD', loads: loads, user: driver});
    }
    // return res.status(200).json({ load });
    return res.status(200).render('load', { title: 'LOAD', load: loads, user: driver });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
async function updateUserLoadById(req, res) {
  try {
    const userId = req.user._id;
    const loadId = req.params.id;
    if (!loadId) {
      return res.status(400).json({ message: 'No id specified' });
    }
    const load = await Load.findOne({ userId, _id: loadId });
    const status = load.status ? load.status : undefined;

    if (!status === 'NEW') {
      return res.status(400).json({ message: "You can only update load with status 'NEW'" });
    }
    await load.updateOne(req.body);
    return res.status(200).json({ redirect: `/api/loads/${loadId}` });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
async function postUserLoadById(req, res) {
  try {
    const loadId = req.params.id;
    const userId = req.user._id;
    if (!loadId) {
      return res.status(400).json({ message: 'No id specified' });
    }
    const load = await Load.findOne({ userId, _id: loadId });
    if (load.status === 'ASSIGNED') {
      return res.status(400).json({ message: 'Load is already assigned' });
    }
    await load.updateOne({
      $set: {
        status: 'POSTED',
      },
      $push: {
        logs: {
          message: 'Load status changed to \'POSTED\'',
          time: new Date().toISOString(),
        },
      },
    });
    // eslint-disable-next-line camelcase
    const driver_found = false;
    const truck = await Truck.findOne({
      status: 'IS',
      assigned_to: { $ne: null },
    });
    const truckInfo = truck ? getType(truck.type) : null;
    if (truck) {
      if (
        load.payload < truckInfo.capacity
        && load.dimensions.width < truckInfo.width
        && load.dimensions.length < truckInfo.length
        && load.dimensions.height < truckInfo.height
      ) {
        await truck.updateOne({ $set: { status: 'OL', shipperId: userId } });
        // eslint-disable-next-line camelcase, no-shadow
        const driver_found = true;
        await load.updateOne({
          $set: {
            status: 'ASSIGNED',
            assigned_to: truck.assigned_to,
            state: 'En route to Pick Up',
          },
          $push: {
            logs: {
              message: `Load assigned to driver with id ${truck.assigned_to}`,
              time: new Date(Date.now()),
            },
          },
        });
        // eslint-disable-next-line camelcase
        // return res.json({ message: 'Load posted successfully', driver_found });
        return res.status(200).json({ redirect: `/api/loads/${loadId}` });
      }
    } else {
      await load.updateOne({
        $set: {
          status: 'NEW',
        },
        $push: {
          logs: {
            message: 'Load status changed to \'NEW\'! Driver not found!',
            time: new Date().toISOString(),
          },
        },
      });
      // eslint-disable-next-line camelcase
      // return res.json({ message: 'Load posted successfully', driver_found });
      return res.status(200).json({ redirect: `/api/loads/${loadId}` });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
async function getUserLoadShippingById(req, res) {
  try {
    const loadId = req.params.id;
    const userId = req.user._id;
    if (!loadId) {
      return res.status(400).json({ message: 'No id specified' });
    }
    const load = await Load.findOne({ userId, _id: loadId });
    if (!load || load.status !== 'ASSIGNED') {
      return res.status(400).json({ message: 'There is no assigned loads' });
    }
    const driverInfo = load.assigned_to;
    const truck = await Truck.findOne({ assigned_to: driverInfo });
    if (!truck) {
      return res.status(400).json({ message: 'Something went wrong :(' });
    }
    // return res.status(200).json({ load, truck });
    return res.status(200).render('shipping_info', { title: 'SHIPPING INFO', load, truck });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
async function iterateToNextLoadState(req, res) {
  try {
    const userId = req.user._id;
    const driver = await User.findById({ _id: userId });
    if (!driver) {
      return res.status(400).json({ message: 'DRIVER not found' });
    }
    const load = await Load.findOne({ assigned_to: userId, status: 'ASSIGNED' });
    const loadId = load._id;
    if (!load) {
      return res.status(400).json({ message: 'loads not found' });
    }
    switch (load.state) {
      case 'En route to Pick Up':
        await load.updateOne({
          $set: {
            state: 'Arrived to Pick Up',
          },
          $push: {
            logs: {
              message: 'Load state changed to \'Arrived to Pick Up\'',
              time: new Date().toISOString(),
            },
          },
        });
        // res.json({
        //   message: 'Load state changed to  \'Arrived to Pick Up\'',
        // });
        return res.status(200).json({ redirect: '/api/loads/active' });
        // res.status(200).json({  redirect: `/api/loads/${loadId}` });
      case 'Arrived to Pick Up':
        await load.updateOne({
          $set: {
            state: 'En route to delivery',
          },
          $push: {
            logs: {
              message: 'Load state changed to \'En route to delivery\'',
              time: new Date().toISOString(),
            },
          },
        });
        // res.json({
        //   message: 'Load state changed to \'En route to delivery\'',
        // });
        return res.status(200).json({ redirect: '/api/loads/active' });
      case 'En route to delivery':
        await load.updateOne({
          $set: {
            state: 'Arrived to delivery',
            status: 'SHIPPED',
          },
          $push: {
            logs: {
              message: 'Load state changed to \'Arrived to delivery\'',
              time: new Date().toISOString(),
            },
          },
        });
        const truck = await Truck.findOne({ shipperId: load.created_by });
        await truck.updateOne({
          $set: {
            status: 'IS',
            shipperId: null,
          },
        });
        // res.json({
        //   message: 'Load state changed to \'Arrived to delivery\'',
        // });
        return res.status(200).json({ redirect: '/api/loads/active' });
      default: res.status(200).json({ redirect: '/api/loads/active' });
    }
    // return res.status(200).json({ load });
    return res.status(200).json({ redirect: '/api/loads/active' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
module.exports = {
  getUserLoads,
  addLoadForUser,
  getUserLoadById,
  deleteUserLoadById,
  getUserActiveLoad,
  updateUserLoadById,
  postUserLoadById,
  getUserLoadShippingById,
  iterateToNextLoadState,
};

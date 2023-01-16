const express = require('express');

const router = express.Router();

const {
  getUserTrucks,
  addTruckForUser,
  getUserTruckById,
  deleteUserTruckById,
  assignTruckToUserById,
  updateUserTruckById,
} = require('../controllers/trucksController');

router.get('/', getUserTrucks); // done
router.post('/', addTruckForUser); // done
router.get('/:id', getUserTruckById); // done
router.delete('/:id', deleteUserTruckById); // done
router.post('/:id/assign', assignTruckToUserById); // done
router.put('/:id', updateUserTruckById); // done
module.exports = router;

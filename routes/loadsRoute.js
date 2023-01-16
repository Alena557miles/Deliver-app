const express = require('express');

const router = express.Router();

const {
  isUserShipper,
  isUserDriver,
} = require('../middleware/userRoleMiddleware');
const {
  getUserLoads,
  addLoadForUser,
  getUserLoadById,
  deleteUserLoadById,
  getUserActiveLoad,
  updateUserLoadById,
  postUserLoadById,
  getUserLoadShippingById,
  iterateToNextLoadState,
} = require('../controllers/loadsController');

router.patch('/active/state', iterateToNextLoadState);
router.get('/active', isUserDriver, getUserActiveLoad); //
router.get('/', getUserLoads); //
router.post('/', isUserShipper, addLoadForUser); //
router.get('/:id', isUserShipper, getUserLoadById); //
router.delete('/:id', isUserShipper, deleteUserLoadById); //
router.put('/:id', isUserShipper, updateUserLoadById); // need to
router.post('/:id/post', isUserShipper, postUserLoadById); // need to
router.get('/:id/shipping_info', isUserShipper, getUserLoadShippingById); // need to

module.exports = router;

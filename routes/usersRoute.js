/* eslint-disable camelcase */
const express = require('express');

const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

const {
  getUser, deleteUser, changePassword_get, changePassword_patch,
} = require('../controllers/userController');

router.get('/', authMiddleware, getUser);
router.delete('/', authMiddleware, deleteUser);
router.get('/password', authMiddleware, changePassword_get);
router.patch('/password', authMiddleware, changePassword_patch);

module.exports = router;

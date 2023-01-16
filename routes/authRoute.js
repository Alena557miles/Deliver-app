/* eslint-disable camelcase */
const express = require('express');

const router = express.Router();

const {
  registerUser_get,
  registerUser_post,
  loginUser_get,
  loginUser_post,
  forgotPassword_get,
  forgotPassword_post,
  logout_get,
} = require('../controllers/authController');

router.get('/register', registerUser_get);
router.post('/register', registerUser_post);

router.get('/login', loginUser_get);
router.post('/login', loginUser_post);

router.get('/forgot_password', forgotPassword_get);
router.post('/forgot_password', forgotPassword_post);

router.get('/logout', logout_get);

module.exports = router;

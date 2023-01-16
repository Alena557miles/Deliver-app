/* eslint-disable camelcase */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passwordGenerator = require('generate-password');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const maxAge = 3 * 24 * 60 * 60;

// handle errors
const handleErrors = (err) => {
  console.log(err.message, err.code);
  const errors = { email: '', password: '' };

  // incorrect email
  if (err.message === 'incorrect email') {
    errors.email = 'That email is not registered';
  }
  // user doesn't exist
  if (err.message === 'User doesn`t exists!') {
    errors.email = 'That email is not registered';
  }
  // incorrect password
  if (err.message === 'incorrect password') {
    errors.password = 'That password is incorrect';
  }

  // duplicate email error
  if (err.code === 11000) {
    errors.email = 'that email is already registered';
    return errors;
  }

  // validation errors
  if (err.message.includes('User validation failed')) {
    // console.log(err);
    Object.values(err.errors).forEach(({ properties }) => {
      // console.log(properties);
      errors[properties.path] = properties.message;
    });
  }

  return errors;
};

async function registerUser_get(req, res) {
  res.status(200).render('register', { title: 'REGISTRATION' });
}
async function loginUser_get(req, res) {
  res.status(200).render('login', { title: 'LOGIN' });
}
async function forgotPassword_get(req, res) {
  const text = '';
  res.status(200).render('forgot_passw', { title: 'FORGOT PASSWORD', text });
}
async function registerUser_post(req, res) {
  const { email, password, role } = req.body;
  // const userExists = await User.findOne({ email });
  // if (userExists) {
  //   return res.status(400).send('User is already exists!');
  // }
  const hashedPass = await bcrypt.hash(password, 10);
  const user = new User({
    email,
    password: hashedPass,
    role,
  });

  try {
    await user.save();
    // return res.status(200).redirect('/api/auth/login');
    // eslint-disable-next-line no-underscore-dangle
    return res.status(201).json({ message: 'Profile created successfully', user: user._id });
  } catch (err) {
    const errors = handleErrors(err);
    return res.status(400).json({ errors });
  }
}
async function loginUser_post(req, res) {
  try {
    const foundUser = await User.findOne({ email: req.body.email });
    if (!foundUser) {
      throw Error('User doesn`t exists!');
      // return res.status(400).json({ message: 'User doesn`t exists!' });
    }
    const match = await bcrypt.compare(req.body.password, foundUser.password);
    if (!match) {
      return res.status(403).send('Access denied');
    }
    const token = jwt.sign(
      // eslint-disable-next-line no-underscore-dangle
      { _id: foundUser._id },
      process.env.ACCESS_TOKEN_SECRET,
    );
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    // return res.redirect('/api/users/me');
    return res.status(201).json({ message: 'Profile created successfully', user: foundUser });
  } catch (err) {
    const errors = handleErrors(err);
    return res.status(400).json({ errors });
  }
}
async function forgotPassword_post(req, res) {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).send('User doesn\'t exists!');
  }
  const newPassword = passwordGenerator.generate({
    length: 16,
    numbers: true,
  });
  const newHashPassword = await bcrypt.hash(newPassword, 10);
  await User.findOneAndUpdate({ email }, { password: newHashPassword });
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_LOGIN,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  await transporter.sendMail({
    from: process.env.EMAIL_LOGIN,
    to: email,
    subject: 'New password',
    text: 'New password',
    html: `<b>Your new password is: <br> ${newPassword}</br>`,
  });

  // return res.status(200).json({
  //   message:
  //       'New password sent to your email address. Check your mail.',
  // });

  // return res.status(200).redirect('/');

  const text = 'New password sent to your email address. Check your mail.';
  return res.status(200).render('forgot_passw', { title: 'FORGOT PASSWORD', text });
}
async function logout_get(req, res) {
  res.cookie('jwt', '', { maxAge: 1 });
  res.redirect('/');
}

module.exports = {
  registerUser_get,
  loginUser_get,
  forgotPassword_get,
  registerUser_post,
  loginUser_post,
  forgotPassword_post,
  logout_get,
};

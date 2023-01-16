/* eslint-disable no-unused-vars */
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoute = require('./routes/authRoute');
const trucksRoute = require('./routes/trucksRoute');
const loadsRoute = require('./routes/loadsRoute');
const usersRoute = require('./routes/usersRoute');

const authMiddleware = require('./middleware/authMiddleware');
const { isUserDriver } = require('./middleware/userRoleMiddleware');

const app = express();

require('dotenv').config();

const PORT = process.env.PORT || 8080;

mongoose.connect(process.env.DATABASE_URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
})
  .then((res) => app.listen(PORT))
  .catch((err) => console.log(err));

app.use(cors());
app.use(express.json());
app.use(cookieParser());
// app.use(morgan('tiny'));
app.set('view engine', 'ejs');

// middleware % static files
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// routers
app.use('/api/auth', authRoute);
app.use('/api/trucks', authMiddleware, isUserDriver, trucksRoute);
app.use('/api/loads', authMiddleware, loadsRoute);
app.use('/api/users/me', usersRoute);

// start page
app.get('/', (req, res) => {
  res.status(200).render('index', { title: 'HOME' });
});

// 404 page
app.use((req, res) => {
  res.status(404).render('404', { title: '404' });
});

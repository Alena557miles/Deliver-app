const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const token = req.cookies.jwt;
  // console.log(token)
  if (!token) {
    return res.status(401).send('Access denied!!!!');
    // throw Error('incorrect password')
  }

  try {
    const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = verified;
    return next();
  } catch (error) {
    return res.status(400).send('Invalid token');
  }
}

module.exports = authMiddleware;

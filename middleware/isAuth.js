const jwt = require('jsonwebtoken');
const config = require('config');

const isAuth = (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    const error = new Error('Could not authenticate!');
    error.statusCode = 401;
    throw error;
  }

  const authToken = authHeader.split(' ')[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(authToken, config.get('jwtPrivateKey'));
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }

  req.user_id = decodedToken._id;
  req.admin = decodedToken.admin;
  next();
};

module.exports = isAuth;

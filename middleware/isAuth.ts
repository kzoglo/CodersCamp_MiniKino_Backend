import jwt from 'jsonwebtoken';
import config from 'config';

import handleErrors from '../assistive_functions/handleErrors';

export const isAuth = (req, res, next) => {
  if (req.body.hasOwnProperty('email') && !req.body.hasOwnProperty('admin'))
    return next();
  const authHeader = req.get('Authorization');
  try {
    if (!authHeader) handleErrors('Could not authenticate!', 401);
  } catch (err) {
    return next(err);
  }

  const authToken = authHeader.split(' ')[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(authToken, config.get('jwtPrivateKey'));
  } catch (err) {
    if (!err.statusCode) err.statusCode = 401;
    return next(err);
  }

  req.user_id = decodedToken._id;
  req.admin = decodedToken.admin;
  next();
};

// module.exports = isAuth;

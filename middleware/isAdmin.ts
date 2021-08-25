import handleErrors from '../assistive_functions/handleErrors';
import {isEqual} from '../predicates';

export const isAdmin = ({ body, admin }, res, next) => {
  if (body.hasOwnProperty('email') && !body.hasOwnProperty('admin'))
    return next();

  try {
    if (!isEqual(admin, true))
      handleErrors('Not an admin. Access forbidden.', 403);
  } catch (err) {
    return next(err);
  }

  next();
};

// module.exports = isAdmin;

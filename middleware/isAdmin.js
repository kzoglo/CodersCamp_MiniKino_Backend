const handleErrors = require('../assistive_functions/handleErrors');
const { isInequal } = require('../predicates');

const isAdmin = ({ body, admin }, res, next) => {
  if (body.hasOwnProperty('email') && !body.hasOwnProperty('admin'))
    return next();

  try {
    if (isInequal(admin, true))
      handleErrors('Not an admin. Access forbidden.', 403);
  } catch (err) {
    return next(err);
  }

  next();
};

module.exports = isAdmin;

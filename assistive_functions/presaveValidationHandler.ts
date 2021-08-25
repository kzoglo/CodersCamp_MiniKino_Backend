const { isEqual } = require('../predicates');

export const presaveValidationHandler = (err, next) => {
  if (isEqual(err.name, 'ValidationError')) {
    err.statusCode = 422;
  }

  next(err);
};

// module.exports = presaveValidationHandler;

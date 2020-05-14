const { isEqual } = require('../predicates');

const presaveValidationHandler = (err, next) => {
  if (isEqual(err.name, 'ValidationError')) {
    err.statusCode = 422;
  }

  next(err);
};

module.exports = presaveValidationHandler;

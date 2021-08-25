const handleErrors = require('./handleErrors');

export const joiValidation = (joiValidate, dataToValidate) => {
  const { error, value } = joiValidate(dataToValidate);
  if (error) handleErrors(error.details[0].message, 422);

  return value;
};

// module.exports = joiValidation;

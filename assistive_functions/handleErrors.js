const handleErrors = (message = 'Server Error', status = 500) => {
  const error = new Error(message);
  error.statusCode = status;
  throw error;
};

module.exports = handleErrors;

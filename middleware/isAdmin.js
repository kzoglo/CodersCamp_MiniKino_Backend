const isAdmin = (req, res, next) => {
  if (!req.admin) {
    const error = new Error('Not an admin. Access forbidden.');
    error.statusCode = 403;
    throw error;
  }
  next();
};

module.exports = isAdmin;

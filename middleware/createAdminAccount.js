const isAdmin = require('../middleware/isAdmin');
const isAuth = require('../middleware/isAuth');

const createAdminAccount = (req, res, next) => {
  const placeholderFunc = () => {};
  if (req.body.admin) {
    isAuth(req, res, placeholderFunc);
    isAdmin(req, res, placeholderFunc);
  }
  next();
};

module.exports = createAdminAccount;

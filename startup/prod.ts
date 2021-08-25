const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

module.exports = function (app) {
  app.use(morgan('tiny'));
  app.use(helmet());
  app.use(compression());
};

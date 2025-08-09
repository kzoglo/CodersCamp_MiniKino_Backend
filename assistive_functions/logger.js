const { isEqual } = require('../predicates');

const logger = (logMessage) => {
  if (!isEqual(process.env.NODE_ENV, 'testing')) {
    console.log(logMessage);
  }
};

module.exports = logger;

const mongoose = require('mongoose');

const handleErrors = require('../assistive_functions/handleErrors');

const areParamsObjectIds = ({ params }, res, next) => {
  const validated = [];
  ((params) => {
    for (const key in params) {
      if (mongoose.Types.ObjectId.isValid(params[key])) {
        validated.push(true);
      } else validated.push(false);
    }
  })(params);

  if (!validated[0] && !validated[1]) handleErrors('Invalid params data.', 422);
  else next();
};

module.exports = areParamsObjectIds;

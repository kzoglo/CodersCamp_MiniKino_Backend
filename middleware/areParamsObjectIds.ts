import mongoose from 'mongoose';

import {isEqual} from '../predicates';
import handleErrors from '../assistive_functions/handleErrors';

export const areParamsObjectIds = ({ params }, res, next) => {
  const validated = [];
  ((params) => {
    for (const key in params) {
      const result = !isEqual(Boolean(params[key]), false)
        ? params[key].toString()
        : '';
      if (
        isEqual(result.length, 24) &&
        mongoose.Types.ObjectId.isValid(result)
      ) {
        validated.push(true);
      } else validated.push(false);
    }
  })(params);

  const isAtLeastOneParamObjectId = () => {
    return validated.includes(true);
  };

  const result = isAtLeastOneParamObjectId();

  if (isEqual(result, false)) handleErrors('Invalid params data.', 422);
  else next();
};

// module.exports = areParamsObjectIds;

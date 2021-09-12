import { NextFunction } from 'express';

import { isEqual } from '../tools/predicates';
import { ServerError } from '../tools/errors/Errors';

export const presaveValidationHandler = (err: ServerError, next: NextFunction) => {
  if (isEqual(err.name, 'ValidationError')) {
    err.status = 422;
  }

  next(err);
};

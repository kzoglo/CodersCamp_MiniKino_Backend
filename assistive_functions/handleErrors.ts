import { ServerError } from '../tools/errors/Errors';

export const handleErrors = (message?: string, status?: number) => {
  const error = new ServerError(status, message);
  throw error;
};

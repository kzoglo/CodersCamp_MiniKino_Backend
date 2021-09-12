//TODO - general middlewares
import { ErrorRequestHandler, NextFunction } from 'express';

interface IMiddlewareError extends Error {
  status: number;
  message: string;
  data: any;
}

export const errorHandler: ErrorRequestHandler = (error: IMiddlewareError, req, res, next) => {
  const { status, message, data } = error;
  res.status(status).json({ message, data });
}

export const removeMongoVersion = (dbData: any, next: NextFunction) => {
  if(!dbData)
    return next();
    
  if(Array.isArray(dbData)) {
    dbData.forEach(doc => delete doc.__v);
    return next();
  }

  delete dbData.__v;
  next();
}

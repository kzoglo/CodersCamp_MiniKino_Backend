import { Application } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';

export const prodStartup = (app: Application) => {
  app.use(morgan('tiny'));
  app.use(helmet());
  app.use(compression());
};

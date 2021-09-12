import mongoose from 'mongoose';
import express, { ErrorRequestHandler } from 'express';
import config from 'config';
// const { dbName, portNb, host, password } = config.get('db');
interface IDbConfig {
  dbName: string;
  portNb: string; 
  host: string;
  password: string;
}

const dbConfig: IDbConfig = config.get('db');
const { dbName, portNb, host, password } = dbConfig;

const app = express();

import { prodStartup } from './tools/startup/prod';
// import user from '../routes/user';
import movie from './modules/Movie/routes';
// import room from '../routes/room';
// import seat from '../routes/seat';
// import screening from '../routes/screening';
// import reservation from '../routes/reservation';
// import login from '../routes/login';
import { isEqual } from './tools/predicates';
import { errorHandler } from './tools/middlewares';
import {string} from 'joi';

if (!config.get('jwtPrivateKey')) {
  console.log('ERROR - jwtPrivateKey: Private key not set');
  process.exit(1);
}

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS,GET,PUT,POST,PATCH,DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

app.use('/images', express.static('images'));

/*** Routing ***/
app.use(express.json());
// app.use('/api/user', user);
app.use('/api/movie', movie);
// app.use('/api/room', room);
// app.use('/api/seat', seat);
// app.use('/api/screening', screening);
// app.use('/api/reservation', reservation);
// app.use('/api/login', login);

app.use(errorHandler);

if (isEqual(process.env.NODE_ENV, 'production')) prodStartup(app); 

// if (isEqual(process.env.NODE_ENV, 'production')) require('./startup/prod')(app);

const dbUri = (() => {
  const nodeEnv = process.env.NODE_ENV;
  if (isEqual(nodeEnv, 'testing'))
    return `mongodb://${host}:${portNb}/${dbName}`;
  if (isEqual(nodeEnv, 'production'))
    return `mongodb+srv://${host}:${password}@cinemadb-20fmo.mongodb.net/${dbName}`;
  return `mongodb://${host}:${portNb}/${dbName}`;
})();

const port = process.env.PORT || 3001;
const server = app.listen(port, () => {
  console.log(`Listening on port ${port}...`);

  mongoose
    .connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    })
    .then(() => {
      console.log(`Connected to ${dbName}...`);
    })
    .catch((err) => {
      console.error(`Could not connect to ${dbName}...`, err);
    });
});

export default server;

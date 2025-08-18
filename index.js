const express = require('express');
const config = require('config');
const app = express();

const user = require('./routes/user');
const movie = require('./routes/movie');
const room = require('./routes/room');
const seat = require('./routes/seat');
const screening = require('./routes/screening');
const reservation = require('./routes/reservation');
const login = require('./routes/login');
const { isEqual } = require('./predicates');
const initializeDatabase = require('./seed/seed');
const { initializeMinIO } = require('./bucket/minio');

if (!config.get('jwtPrivateKey')) {
  console.error('ERROR - jwtPrivateKey: Klucz prywatny nie został ustawiony');
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

/*** Routing ***/
app.use(express.json());
app.use('/api/user', user);
app.use('/api/movie', movie);
app.use('/api/room', room);
app.use('/api/seat', seat);
app.use('/api/screening', screening);
app.use('/api/reservation', reservation);
app.use('/api/login', login);

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.use((error, req, res, _) => {
  const { statusCode = 500, message, data } = error;
  res.status(statusCode).json({ message, data });
});

// TODO: to do zmiany bedzie
if (isEqual(process.env.NODE_ENV, 'production')) require('./startup/prod')(app);

const port = config.get('port') || 3001;

if (!isEqual(process.env.NODE_ENV, 'testing')) {
  app.listen(port, async () => {
    console.log(`Listening on port ${port}...`);

    await initializeDatabase();
    await initializeMinIO();
  });
}

module.exports = app;

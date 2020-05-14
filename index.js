const mongoose = require('mongoose');
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

if (!config.get('jwtPrivateKey')) {
  console.log('ERROR - jwtPrivateKey: Klucz prywatny nie został ustawiony');
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
app.use('/api/user', user);
app.use('/api/movie', movie);
app.use('/api/room', room);
app.use('/api/seat', seat);
app.use('/api/screening', screening);
app.use('/api/reservation', reservation);
app.use('/api/login', login);

app.use((error, req, res, next) => {
  const { statusCode = 500, message, data } = error;
  res.status(statusCode).json({ message, data });
});

require('./startup/prod')(app);

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
  mongoose
    .connect(
      `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cinemadb-20fmo.mongodb.net/${process.env.MONGO_DEF_DB}`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
      }
    )
    .then(() => console.log('Connected to MongoDB...'))
    .catch((err) => console.error('Could not connect to MongoDB...', err));
});

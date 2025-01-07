const mongoose = require('mongoose');
const User = require('./models/user');
const Room = require('./models/room');
const Seat = require('./models/seat');
const Movie = require('./models/movie');
const Screening = require('./models/screening');
const Reservation = require('./models/reservation');

const movies = [];

mongoose
  // TODO - tutaj connect musi isc oparty na zmiennych srodowiskowych
  .connect('mongodb://localhost:27017/moviesDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log('Connected to MongoDB');

    // Usuwanie istniejących dokumentów
    await Movie.deleteMany();
    console.log('Existing data cleared');

    // Wstawianie nowych danych
    await Movie.insertMany(movies);
    console.log('Seed data added successfully');

    mongoose.disconnect();
  })
  .catch((err) => {
    console.error('Database connection failed', err);
  });

const mongoose = require('mongoose');
const config = require('config');
const { User } = require('../models/user');
const { Room } = require('../models/room');
const { Seat } = require('../models/seat');
const { Movie } = require('../models/movie');
const { Screening } = require('../models/screening');
const { Reservation } = require('../models/reservation');

const movies = require('./collections/movies.json');
const users = require('./collections/users.json');
const rooms = require('./collections/rooms.json');
const seats = require('./collections/seats.json');
const screenings = require('./collections/screenings.json');
const reservations = [];

const clearDatabase = async () => {
  await Movie.deleteMany();
  await Reservation.deleteMany();
  await Screening.deleteMany();
  await Seat.deleteMany();
  await Room.deleteMany();
  await User.deleteMany();

  console.log('Existing data cleared');
};

const seedDatabase = async () => {
  await User.insertMany(users);
  await Movie.insertMany(movies);
  await Room.insertMany(rooms);
  await Seat.insertMany(seats);
  await Screening.insertMany(screenings);
  await Reservation.insertMany(reservations);

  console.log('Seed data added successfully');
};

const initializeDatabase = async () => {
  try {
    const { dbName, dbPort, dbHost, password } = config.get('db');
    const connectionString = password
      ? `mongodb://root:${password}@${dbHost}:${dbPort}/${dbName}?authSource=admin`
      : `mongodb://${dbHost}:${dbPort}/${dbName}`;

    await mongoose.connect(connectionString);
    console.log(`Connected to MongoDB at ${dbHost}:${dbPort}`);

    await clearDatabase();
    await seedDatabase();
  } catch (err) {
    console.error('Database connection failed', err);
    await mongoose.disconnect();
    process.exit(1);
  }
};

module.exports = initializeDatabase;

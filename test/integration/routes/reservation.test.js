const sinon = require('sinon');
const request = require('supertest');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;
const jwt = require('jsonwebtoken');
const config = require('config');
const mongoose = require('mongoose');
const initializeDatabase = require('../../../seed/seed');
const { initializeMinIO } = require('../../../bucket/minio');
const { Seat } = require('../../../models/seat');
const { Room } = require('../../../models/room');
const { Movie } = require('../../../models/movie');
const { Screening } = require('../../../models/screening');

describe('/api/reservation', () => {
  let app, reservations, user_id, screening_id, seat_id2;
  let token;

  require.cache[require.resolve('../../../assistive_functions/validateId')] = {
    exports: {
      validateId: sinon.stub(),
      validationMsg: sinon.stub(),
    },
  };
  delete mongoose.models['Reservation'];
  const { Reservation } = require('../../../models/reservation');

  before(async () => {
    app = require('../../../index');
    await initializeDatabase();
    await initializeMinIO();
  });

  after(() => {
    delete require.cache[
      require.resolve('../../../assistive_functions/validateId')
    ];
  });

  beforeEach(async () => {
    await Room.deleteMany({});
    await Movie.deleteMany({});
    await Seat.deleteMany({});
    await Screening.deleteMany({});
    await Reservation.deleteMany({});

    const seat_id = '012345678901234567894322';
    seat_id2 = '012345678901234567894999';
    const movie_id = '012345678901234567894321';
    const room_id = '112345678901234567891234';
    const reservation_id = '112345678901234567891444';
    screening_id = '012345678901231567194321';
    user_id = require('../../../seed/collections/users.json')[0]._id.toString();

    const seats = [
      {
        _id: seat_id,
        room_id,
        row: 1,
        seatNumber: 1,
      },
      {
        _id: seat_id2,
        room_id,
        row: 1,
        seatNumber: 2,
      },
    ];
    const rooms = [{ _id: room_id, name: 1 }];
    const movies = [
      {
        _id: movie_id,
        title: 'Test Movie',
        year: 2019,
        genre: 'komedia',
        description: 'Testowy opis filmu.',
        imageUrl: 'jumanji.jpg',
        __v: 0,
      },
    ];
    const screenings = [
      {
        _id: screening_id,
        movie_id,
        room_id,
        time: 1830297600000,
        __v: 0,
      },
    ];
    await Room.insertMany(rooms);
    await Movie.insertMany(movies);
    await Seat.insertMany(seats);
    await Screening.insertMany(screenings);

    reservations = [
      {
        _id: reservation_id,
        user_id,
        seat_id,
        screening_id,
      },
    ];

    token = jwt.sign({ _id: user_id }, config.get('jwtPrivateKey'));

    await Reservation.insertMany(reservations);
  });

  /*** 'GET /:user_id/:screening_id' ***/
  describe('GET /:user_id/:screening_id', () => {
    it('should return response with "statusCode" 200 and json object with found reservations, if both parameters set in request are valid', async () => {
      await request(app)
        .get(`/api/reservation/${user_id}/${screening_id}`)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .then(({ body }) => {
          const responseReserv_id = body[0]._id;
          const insertedReserv_id = reservations[0]._id;
          expect(responseReserv_id).to.be.eq(insertedReserv_id);
        });
    });

    it('should return response with "statusCode" 200 and json object with found reservations, if only valid parameter set in request is "screening_id"', async () => {
      await request(app)
        .get(`/api/reservation/dummy/${screening_id}`)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .then(({ body }) => {
          const responseReserv_id = body[0]._id;
          const insertedReserv_id = reservations[0]._id;
          expect(responseReserv_id).to.be.eq(insertedReserv_id);
        });
    });

    it('should return response with "statusCode" 200 and json object with found reservations, if only valid parameter set in request is "user_id"', async () => {
      await request(app)
        .get(`/api/reservation/${user_id}/dummy`)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .then(({ body }) => {
          const responseReserv_id = body[0]._id;
          const insertedReserv_id = reservations[0]._id;
          expect(responseReserv_id).to.be.eq(insertedReserv_id);
        });
    });

    it('should call "next" middleware with an err obj as parameter and eventually returns response with "statusCode" 403 and "message" - "Not authorized. You\'re trying to access resource you do not have permission to.", if "user_id" parameter from req not match "user_id" parameter decoded previously from JWT', async () => {
      token = jwt.sign(
        { _id: '112345081901213456780120' },
        config.get('jwtPrivateKey')
      );

      await request(app)
        .get(`/api/reservation/${user_id}/${screening_id}`)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .expect(403)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq(
            "Not authorized. You're trying to access resource you do not have permission to."
          );
        });
    });

    it('should call "next" middleware with an err obj as parameter and eventually returns response with "statusCode" 500 and "message" - "Internal database error.", if reservations cannot be found due to database error', async () => {
      const err = new Error('Internal database error.');
      err.statusCode = 500;
      sinon.stub(mongoose.Model, 'find').throws(err);

      await request(app)
        .get(`/api/reservation/${user_id}/${screening_id}`)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .expect(500)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('Internal database error.');
          mongoose.Model.find.restore();
        });
    });
  });

  /*** 'POST /' ***/
  describe('POST /', () => {
    let reservation;

    beforeEach(() => {
      reservation = {
        user_id,
        seat_id: seat_id2,
        screening_id,
      };
    });

    it('should return response with "statusCode" 201 and json object with "message" prop - "Successful reservation.", if reservation has been properly saved in database', async () => {
      await request(app)
        .post('/api/reservation')
        .send(reservation)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .expect(201)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('Successful reservation.');
        });
    });

    it('should return response with "statusCode" 401 and json object with "message" prop - "Could not authenticate!", if "Authorization" header is not present', async () => {
      await request(app)
        .post('/api/reservation')
        .send(reservation)
        .set('Content-Type', 'application/json')
        .expect(401)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('Could not authenticate!');
        });
    });

    it('should return response with "statusCode" 401 and json object with "message" prop - "jwt must be provided", if JWT is not present', async () => {
      token = '';

      await request(app)
        .post('/api/reservation')
        .send(reservation)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .expect(401)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('jwt must be provided');
        });
    });

    it('should return response with "statusCode" 401 and json object with "message" prop - "jwt malformed", if JWT is not valid', async () => {
      token = 'invalid';

      await request(app)
        .post('/api/reservation')
        .send(reservation)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .expect(401)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('jwt malformed');
        });
    });

    it('should call "presaveValidationHandler" with error code 422 and eventually return response with the same status and "message" - "\'user_id\' with value \'wrong\' fails to match the valid mongo id pattern", if even one of props from request payload is not an ObjectId (here, as an example "user_id")', async () => {
      reservation = {
        user_id: 'wrong',
        seat_id: '512345678910123456789191',
        screening_id: '993456789012314567891235',
      };

      await request(app)
        .post('/api/reservation')
        .send(reservation)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .expect(422)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq(
            '"user_id" with value "wrong" fails to match the valid mongo id pattern'
          );
        });
    });

    it('should call "presaveValidationHandler" with error code 403 and eventually return response with the same status and "message" - "You do not have access to the requested resource.", if "user_id" from req.body not match "user_id" parameter decoded previously from JWT', async () => {
      reservation.user_id = '112345088901613456789120';

      await request(app)
        .post('/api/reservation')
        .send(reservation)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .expect(403)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq(
            'You do not have access to the requested resource.'
          );
        });
    });

    it('should call "presaveValidationHandler" with error code 409 and eventually return response with the same status and "message" - "Reservation has been already created.", if reservation with the same "seat_id" and "screening_id" already exists in database', async () => {
      reservation = reservations[0];
      delete reservation._id;

      await request(app)
        .post('/api/reservation')
        .send(reservation)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .expect(409)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('Reservation has been already created.');
        });
    });

    it('should call "presaveValidationHandler" with error code 500 and eventually return response with the same status and "message" - "Internal database error.", if reservation cannot be make due to database error', async () => {
      const err = new Error('Internal database error.');
      err.statusCode = 500;
      sinon.stub(mongoose.Model.prototype, 'save').throws(err);

      await request(app)
        .post('/api/reservation')
        .send(reservation)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .expect(500)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('Internal database error.');
          mongoose.Model.prototype.save.restore();
        });
    });
  });
});

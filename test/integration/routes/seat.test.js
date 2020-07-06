const sinon = require('sinon');
const request = require('supertest');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;
const jwt = require('jsonwebtoken');
const config = require('config');
const mongoose = require('mongoose');

const { Seat } = require('../../../models/seat');
const { Room } = require('../../../models/room');

describe('/api/seat', () => {
  let server, token, seatsDocs, roomsDocs, room_id;

  before(() => {
    server = require('../../../index');
  });

  after(() => {
    server.close();
  });

  beforeEach(async () => {
    token = jwt.sign(
      { _id: '012345678901234567894321', admin: true },
      config.get('jwtPrivateKey')
    );
    room_id = '000005678901234567891234';

    roomsDocs = [
      {
        _id: room_id,
        name: 99,
      },
    ];

    await Room.insertMany(roomsDocs);

    seatsDocs = [
      {
        _id: '112345678901234567891234',
        room_id,
        row: 1,
        seatNumber: 1,
      },
      {
        _id: '012345678901234567891230',
        room_id,
        row: 1,
        seatNumber: 2,
      },
    ];

    await Seat.insertMany(seatsDocs);
  });

  afterEach(async () => {
    await Room.deleteMany({});
    await Seat.deleteMany({});
  });

  /*** 'GET /' ***/
  describe('GET /', () => {
    it('should return response with status 200 and json object, which contains found seats or no seats(empty array)', async () => {
      alteredSeatsDocs = seatsDocs.map((seatObj) => {
        seatObj.room_id = { name: roomsDocs[0].name };
        return seatObj;
      });

      await request(server)
        .get('/api/seat')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .then(({ body: seatsArr }) => {
          const alteredSeatsArr = [];
          seatsArr.forEach((seatObj) => {
            delete seatObj.__v;
            alteredSeatsArr.push(seatObj);
          });
          expect(alteredSeatsArr)
            .to.be.an('array')
            .that.is.deep.eq(alteredSeatsDocs);
        });
    });

    it('should call "next" middleware with err object as an argument and eventually return response with status 500 and json object with "message" prop - "Internal database error.", if seat cannot be found due to database error', async () => {
      const err = new Error('Internal database error.');
      err.statusCode = 500;
      sinon.stub(Seat, 'find').throws(err);

      await request(server)
        .get('/api/seat')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .expect(500)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('Internal database error.');
          Seat.find.restore();
        });
    });

    it('should return response with status 401 and json object with "message" prop - "Could not authenticate!", if "Authorization" token is not present', async () => {
      await request(server)
        .get('/api/seat')
        .set('Content-Type', 'application/json')
        .expect(401)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('Could not authenticate!');
        });
    });

    it('should return response with status 401 and json object with "message" prop - "jwt must be provided", if "Authorization" token is not present', async () => {
      token = '';

      await request(server)
        .get('/api/seat')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .expect(401)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('jwt must be provided');
        });
    });

    it('should return response with status 401 and json object with "message" prop - "jwt malformed", if "Authorization" token is not present', async () => {
      token = 'wrong';

      await request(server)
        .get('/api/seat')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .expect(401)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('jwt malformed');
        });
    });
  });

  /*** 'GET /:room_id' ***/
  describe('GET /:room_id', () => {
    it('should return response with status 200 and json object, which contains found seats or no seats(empty array), if req contains "room_id" param, which forms valid ObjectId', async () => {
      alteredSeatsDocs = seatsDocs.map((seatObj) => {
        seatObj.room_id = { name: roomsDocs[0].name };
        return seatObj;
      });

      await request(server)
        .get(`/api/seat/${room_id}`)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .then(({ body: seatsArr }) => {
          const alteredSeatsArr = [];
          seatsArr.forEach((seatObj) => {
            delete seatObj.__v;
            alteredSeatsArr.push(seatObj);
          });
          expect(alteredSeatsArr)
            .to.be.an('array')
            .that.is.deep.eq(alteredSeatsDocs);
        });
    });

    it('should call "next" middleware with an err object and eventually return response with status 422 and json object, which contains "message" prop - "Invalid req parameters data.", if req contains "room_id" param, which is not of type ObjectId', async () => {
      room_id = 'wrong';

      await request(server)
        .get(`/api/seat/${room_id}`)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .expect(422)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('Invalid req parameters data.');
        });
    });

    it('should call "next" middleware with an err object as an argument and eventually return response with status 500 and json object with "message" prop - "Internal database error.", if seat cannot be found due to database error', async () => {
      const err = new Error('Internal database error.');
      err.statusCode = 500;
      sinon.stub(Seat, 'find').throws(err);

      await request(server)
        .get(`/api/seat/${room_id}`)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .expect(500)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('Internal database error.');
          Seat.find.restore();
        });
    });

    it('should return response with status 401 and json object with "message" prop - "Could not authenticate!", if "Authorization" token is not present', async () => {
      await request(server)
        .get(`/api/seat/${room_id}`)
        .set('Content-Type', 'application/json')
        .expect(401)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('Could not authenticate!');
        });
    });

    it('should return response with status 401 and json object with "message" prop - "jwt must be provided", if "Authorization" token is not present', async () => {
      token = '';

      await request(server)
        .get(`/api/seat/${room_id}`)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .expect(401)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('jwt must be provided');
        });
    });

    it('should return response with status 401 and json object with "message" prop - "jwt malformed", if "Authorization" token is not present', async () => {
      token = 'wrong';

      await request(server)
        .get(`/api/seat/${room_id}`)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .expect(401)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('jwt malformed');
        });
    });
  });

  /*** 'GET /:room_id/:row/:seatNumber' ***/
  describe('GET /:room_id/:row/:seatNumber', () => {
    let row, seatNumber;

    beforeEach(() => {
      row = 1;
      seatNumber = 1;
    });

    it('should return response with status 200 and json object, which contains found seat, if wanted seat was found', async () => {
      await request(server)
        .get(`/api/seat/${room_id}/${row}/${seatNumber}`)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .then(({ body: seat }) => {
          delete seat.__v;
          expect(seat).to.be.deep.eq(seatsDocs[0]);
        });
    });

    it('should call "next" middleware with an err obj and ultimately return response with status 404 and json object, which contains "message" prop - "Seat not found.", if wanted seat was not found', async () => {
      seatNumber = 200;

      await request(server)
        .get(`/api/seat/${room_id}/${row}/${seatNumber}`)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .expect(404)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('Seat not found.');
        });
    });

    it('should call "next" middleware with an err object as an argument and eventually return response with status 500 and json object with "message" prop - "Internal database error.", if seat cannot be found due to database error', async () => {
      const err = new Error('Internal database error.');
      err.statusCode = 500;
      sinon.stub(Seat, 'findOne').throws(err);

      await request(server)
        .get(`/api/seat/${room_id}/${row}/${seatNumber}`)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .expect(500)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('Internal database error.');
          Seat.findOne.restore();
        });
    });

    it('should return response with status 401 and json object with "message" prop - "Could not authenticate!", if "Authorization" token is not present', async () => {
      await request(server)
        .get(`/api/seat/${room_id}/${row}/${seatNumber}`)
        .set('Content-Type', 'application/json')
        .expect(401)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('Could not authenticate!');
        });
    });

    it('should return response with status 401 and json object with "message" prop - "jwt must be provided", if "Authorization" token is not present', async () => {
      token = '';

      await request(server)
        .get(`/api/seat/${room_id}/${row}/${seatNumber}`)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .expect(401)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('jwt must be provided');
        });
    });

    it('should return response with status 401 and json object with "message" prop - "jwt malformed", if "Authorization" token is not present', async () => {
      token = 'wrong';

      await request(server)
        .get(`/api/seat/${room_id}/${row}/${seatNumber}`)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .expect(401)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('jwt malformed');
        });
    });
  });

  /*** 'POST /' ***/
  describe('POST /', () => {
    let seat;

    beforeEach(() => {
      seat = {
        room_id,
        row: 2,
        seatNumber: 1,
      };
    });

    it('should return response with status 201 and json obj, which contains "message" prop - "Seat was successfully created.", if seat has been properly saved into database', async () => {
      await request(server)
        .post('/api/seat')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(seat)
        .expect(201)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('Seat was successfully created.');
        });
    });

    it('should call "presaveValidationHandler" with an err obj an ultimately return response with status 422 and json obj, which contains "message" prop - \'"room_id" with value "not an ObjectId" fails to match the valid mongo id pattern\', if one of request\'s payload props doesn\'t match its appropriate schema', async () => {
      seat.room_id = 'not an ObjectId';

      await request(server)
        .post('/api/seat')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(seat)
        .expect(422)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq(
            '"room_id" with value "not an ObjectId" fails to match the valid mongo id pattern'
          );
        });
    });

    it('should call "presaveValidationHandler" with an err obj an ultimately return response with status 409 and json obj, which contains "message" prop - "Seat has been already created.", if seat with same properties has been already created in database', async () => {
      await Seat.insertMany([seat]);

      await request(server)
        .post('/api/seat')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(seat)
        .expect(409)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('Seat has been already created.');
        });
    });

    it('should call "presaveValidationnHandler" with err obj as an argument and eventually return response with status 500 and json obj with a "message" prop - "Internal database error.", if document cannot be saved due to database error', async () => {
      const err = new Error('Internal database error.');
      err.statusCode = 500;
      sinon.stub(mongoose.Model.prototype, 'save').throws(err);

      await request(server)
        .post('/api/seat')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(seat)
        .expect(500)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('Internal database error.');
          mongoose.Model.prototype.save.restore();
        });
    });

    it('should return response with "statusCode" 401 and json object with "message" prop - "Could not authenticate!", if "Authorization" header is not present', async () => {
      await request(server)
        .post('/api/seat')
        .set('Content-Type', 'application/json')
        .send(seat)
        .expect(401)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('Could not authenticate!');
        });
    });

    it('should return response with "statusCode" 401 and json object with "message" prop - "jwt must be provided", if JWT is not present', async () => {
      token = '';

      await request(server)
        .post('/api/seat')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(seat)
        .expect(401)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('jwt must be provided');
        });
    });

    it('should return response with "statusCode" 401 and json object with "message" prop - "jwt malformed", if JWT is not valid', async () => {
      token = 'invalid';

      await request(server)
        .post('/api/seat')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(seat)
        .expect(401)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('jwt malformed');
        });
    });

    it('should return response with "statusCode" 403 and json object with "message" prop - "Not an admin. Access forbidden.", if request comes from a user without admin permissions', async () => {
      token = jwt.sign(
        { _id: '012345678901234567891234', admin: false },
        config.get('jwtPrivateKey')
      );

      await request(server)
        .post('/api/seat')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(seat)
        .expect(403)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('Not an admin. Access forbidden.');
        });
    });
  });
});

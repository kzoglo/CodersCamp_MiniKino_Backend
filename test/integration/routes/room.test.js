const mongoose = require('mongoose');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;
const request = require('supertest');
const jwt = require('jsonwebtoken');
const config = require('config');
const sinon = require('sinon');

const { Room } = require('../../../models/room');

describe('/api/room', () => {
  let server, roomsDoc, room, token;

  /*** 'POST /' ***/
  describe('POST /', () => {
    beforeEach(() => {
      room = { name: 1 };
      token = jwt.sign(
        { _id: '012345678901234567891234', admin: true },
        config.get('jwtPrivateKey')
      );
    });

    before(async () => {
      server = require('../../../index');
      roomsDoc = [
        {
          _id: '123401234567890123456789',
          name: 2,
        },
        {
          _id: '123401234567890123456780',
          name: 3,
        },
      ];
      await Room.insertMany(roomsDoc);
    });

    after(async () => {
      await Room.deleteMany({});
      server.close();
    });

    it('should return response with status 201 and json object with a "message" prop - "Room successfully created.", if room was created successfully', async () => {
      await request(server)
        .post('/api/room')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(room)
        .expect(201)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('Room successfully created.');
        });
    });

    it('should return response with status 401 and a "message" prop - "Could not authenticate!", if no "Authorization" header is set', async () => {
      await request(server)
        .post('/api/room')
        .set('Content-Type', 'application/json')
        .send(room)
        .expect(401)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('Could not authenticate!');
        });
    });

    it('should return response with status 401 and a "message" prop - "jwt must be provided", if no JWT in "Authorization" header is set', async () => {
      token = '';

      await request(server)
        .post('/api/room')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(room)
        .expect(401)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('jwt must be provided');
        });
    });

    it('should return response with status 401 and a "message" prop - "jwt malformed", if JWT in "Authorization" header is malformed', async () => {
      token = 'wrong';

      await request(server)
        .post('/api/room')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(room)
        .expect(401)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('jwt malformed');
        });
    });

    it('should return response with status 403 and a "message" prop - "Not an admin. Access forbidden.", if an "admin" prop in JWT payload is falsy', async () => {
      token = jwt.sign(
        { id: '012345678901234567891234', admin: false },
        config.get('jwtPrivateKey')
      );

      await request(server)
        .post('/api/room')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(room)
        .expect(403)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('Not an admin. Access forbidden.');
        });
    });

    it('should call "presaveValidationHandler" with an error obj and eventually return response with status 422 and json obj with a "message" prop - \'"name" must be a number\', if "name" prop in req payload is not a number', async () => {
      room.name = 'wrong';

      await request(server)
        .post('/api/room')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(room)
        .expect(422)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('"name" must be a number');
        });
    });

    it('should call "presaveValidationHandler" with an error obj and eventually return response with status 409 and json obj with a "message" prop - "Room has been already created.", if room with the same "name" prop has been already created', async () => {
      room = { name: 2 };

      await request(server)
        .post('/api/room')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(room)
        .expect(409)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('Room has been already created.');
        });
    });

    it('should call "presaveValidationHandler" with an error obj and eventually return response with status 500 and json obj with a "message" prop - "Internal database error.", if room cannot be saved due to database error', async () => {
      room = { name: 100 };
      const err = new Error('Internal database error.');
      err.statusCode = 500;
      sinon.stub(mongoose.Model.prototype, 'save').throws(err);

      await request(server)
        .post('/api/room')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(room)
        .expect(500)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('Internal database error.');
          mongoose.Model.prototype.save.restore();
        });
    });
  });
});

const sinon = require('sinon');
const request = require('supertest');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;
const jwt = require('jsonwebtoken');
const config = require('config');
const mongoose = require('mongoose');

const { Screening } = require('../../../models/screening');
const { Room } = require('../../../models/room');

describe('/api/screening', () => {
  let server,
    token,
    screeningsDocs,
    rooms,
    movie_id,
    screening_id,
    room_id,
    screening;

  before(() => {
    server = require('../../../index');
  });

  after(() => {
    server.close();
  });

  beforeEach(async () => {
    movie_id = '012345678901234567894321';
    screening_id = '012345678901231567194321';
    room_id = '112345678901234567891234';

    token = jwt.sign(
      { _id: '012345678901234567891234', admin: true },
      config.get('jwtPrivateKey')
    );

    screeningsDocs = [
      {
        _id: screening_id,
        movie_id,
        room_id,
        time: new Date().toISOString(),
      },
    ];
    await Screening.insertMany(screeningsDocs);

    rooms = [{ _id: room_id, name: 1 }];
    await Room.insertMany(rooms);

    screening = Object.assign({}, screeningsDocs[0]);
    screening.room_id = rooms[0];
    screening.room_id.__v = 0;
  });

  afterEach(async () => {
    await Screening.deleteMany({});
    await Room.deleteMany({});
  });

  /*** 'GET /' ***/
  describe('GET /', () => {
    it('should return response with status 200 and json obj with all screenings from database, if at least one screening was found', async () => {
      await request(server)
        .get('/api/screening')
        .set('Content-Type', 'application/json')
        .expect(200)
        .then(({ body: resScreening }) => {
          delete resScreening[0].__v;
          expect(resScreening)
            .to.be.an('array')
            .that.is.deep.eq(screeningsDocs);
        });
    });

    it('should call "next" middleware with err obj as an arg and eventually return response with status 500 and json obj with "message" prop - "Internal database error.", if database error occured.', async () => {
      const err = new Error('Internal database error.');
      err.statusCode = 500;
      sinon.stub(Screening, 'find').throws(err);

      await request(server)
        .get('/api/screening')
        .set('Content-Type', 'application/json')
        .expect(500)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('Internal database error.');
          Screening.find.restore();
        });
    });

    it('should call "next" middleware with err obj as an arg and eventually return response with status 404 and json obj with "message" prop - "No screenings found!", if database contains no screenings.', async () => {
      await Screening.deleteMany({});

      await request(server)
        .get('/api/screening')
        .set('Content-Type', 'application/json')
        .expect(404)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('No screenings found!');
        });
    });
  });

  /*** 'GET /:movie_id/:screening_id' ***/
  describe('GET /:movie_id/:screening_id', () => {
    it('should return response with status 200 and json obj with found screening, if at least req "screening_id" param is a valid ObjectId and wanted screening were found', async () => {
      await request(server)
        .get(`/api/screening/${movie_id}/${screening_id}`)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .then(({ body: resScreening }) => {
          delete resScreening.__v;
          expect(resScreening).to.be.deep.eq(screening);
        });
    });

    it('should return response with status 200 and json obj with found screening/screenings, if only req "movie_id" param is a valid ObjectId and wanted screening/screenings were found', async () => {
      screening_id = 'wrong';

      await request(server)
        .get(`/api/screening/${movie_id}/${screening_id}`)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .then(({ body: resScreeningsArr }) => {
          delete resScreeningsArr[0].__v;
          expect(resScreeningsArr[0]).to.be.deep.eq(screening);
        });
    });

    it('should call "next" middleware with an error obj and eventually return response with status 404 and json obj "message" prop - "Screening not found!", if at least req "screening_id" param is a valid ObjectId and wanted screening were not found', async () => {
      screening_id = 'aaaaaaaaaaaaaaaaaaaaaaaa';

      await request(server)
        .get(`/api/screening/${movie_id}/${screening_id}`)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .expect(404)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('Screening not found!');
        });
    });

    it('should return response with status 200 and json obj with an empty array, if only req "movie_id" param is a valid ObjectId and no screenings were found', async () => {
      screening_id = 'wrong';
      movie_id = 'aaaaaaaaaaaaaaaaaaaaaaaa';

      await request(server)
        .get(`/api/screening/${movie_id}/${screening_id}`)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .then(({ body: resScreeningsArr }) => {
          expect(resScreeningsArr).to.be.an('array').that.is.empty;
        });
    });

    it('should return response with status 401 and json obj with a "message" prop - "Could not authenticate!", if the "Authorization" header is no present', async () => {
      await request(server)
        .get(`/api/screening/${movie_id}/${screening_id}`)
        .set('Content-Type', 'application/json')
        .expect(401)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('Could not authenticate!');
        });
    });

    it('should return response with status 401 and json obj with a "message" prop - "jwt must be provided", if JWT in the "Authorization" header is no present', async () => {
      token = '';

      await request(server)
        .get(`/api/screening/${movie_id}/${screening_id}`)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .expect(401)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('jwt must be provided');
        });
    });

    it('should return response with status 401 and json obj with a "message" prop - "jwt malformed", if JWT in the "Authorization" header is no present', async () => {
      token = 'wrong';

      await request(server)
        .get(`/api/screening/${movie_id}/${screening_id}`)
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
    let screeningToWrite;

    beforeEach(() => {
      screeningToWrite = {
        movie_id: '012345678901234123456781',
        room_id: '012345678901234123456782',
        time: new Date().toISOString(),
      };
    });

    it('should return response with status 201 and json obj with a "message" prop - "Screening created successfully.", if screening has been written in database successfully', async () => {
      await request(server)
        .post(`/api/screening/`)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(screeningToWrite)
        .expect(201)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('Screening created successfully.');
        });
    });

    it('should call "presaveValidationnHandler" with err obj as an argument and eventually return response with status 422 and json obj with a "message" prop - \'movie_id" with value "wrong" fails to match the valid mongo id pattern\', if data from req payload is not consistent with screening schema', async () => {
      screeningToWrite.movie_id = 'wrong';

      await request(server)
        .post(`/api/screening/`)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(screeningToWrite)
        .expect(422)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq(
            '"movie_id" with value "wrong" fails to match the valid mongo id pattern'
          );
        });
    });

    it('should call "presaveValidationnHandler" with err obj as an argument and eventually return response with status 409 and json obj with a "message" prop - "Screening has been already created.", if there is another same screening already in database', async () => {
      await Screening.insertMany([screeningToWrite]);

      await request(server)
        .post(`/api/screening/`)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(screeningToWrite)
        .expect(409)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('Screening has been already created.');
        });
    });

    it('should call "presaveValidationnHandler" with err obj as an argument and eventually return response with status 500 and json obj with a "message" prop - "Internal database error.", if document cannot be saved due to database error', async () => {
      const err = new Error('Internal database error.');
      err.statusCode = 500;
      sinon.stub(mongoose.Model.prototype, 'save').throws(err);

      await request(server)
        .post(`/api/screening/`)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(screeningToWrite)
        .expect(500)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('Internal database error.');
          mongoose.Model.prototype.save.restore();
        });
    });

    it('should return response with "statusCode" 401 and json object with "message" prop - "Could not authenticate!", if "Authorization" header is not present', async () => {
      await request(server)
        .post(`/api/screening/`)
        .set('Content-Type', 'application/json')
        .send(screeningToWrite)
        .expect(401)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('Could not authenticate!');
        });
    });

    it('should return response with "statusCode" 401 and json object with "message" prop - "jwt must be provided", if JWT is not present', async () => {
      token = '';

      await request(server)
        .post(`/api/screening/`)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(screeningToWrite)
        .expect(401)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('jwt must be provided');
        });
    });

    it('should return response with "statusCode" 401 and json object with "message" prop - "jwt malformed", if JWT is not valid', async () => {
      token = 'invalid';

      await request(server)
        .post(`/api/screening/`)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(screeningToWrite)
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
        .post(`/api/screening/`)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(screeningToWrite)
        .expect(403)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('Not an admin. Access forbidden.');
        });
    });
  });
});

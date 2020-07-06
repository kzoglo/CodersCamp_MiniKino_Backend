const sinon = require('sinon');
const request = require('supertest');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;
const jwt = require('jsonwebtoken');
const config = require('config');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { isEqual } = require('../../../predicates');

const { User } = require('../../../models/user');

describe('/api/user', () => {
  let server, token, user, userToSave;

  before(() => {
    server = require('../../../index');
  });

  after(() => {
    server.close();
  });

  beforeEach(async () => {
    token = jwt.sign(
      { _id: '012345678901234567891234', admin: true },
      config.get('jwtPrivateKey')
    );

    const password = '12345678';
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    user = {
      _id: '000000678901234567891234',
      name: 'kamil',
      surname: 'kamil',
      email: 'kamil1@wp.pl',
      password: hashedPass,
    };

    userToSave = Object.assign({}, user);
    delete userToSave._id;
    userToSave.email = 'dummy@wp.pl';
    userToSave.password = '12345678';
    userToSave.confirmPassword = '12345678';

    await User.insertMany([user]);
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  /*** 'POST /' ***/
  describe('POST /', () => {
    it('should return response with status 201 and json obj with "message" prop - "User created successfully.", if standard user account (not an admin) has been successfully created', async () => {
      await request(server)
        .post('/api/user')
        .set('Content-Type', 'application/json')
        .send(userToSave)
        .expect(201)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('User created successfully.');
        });
    });

    it('should return response with status 201 and json obj with "message" prop - "User created successfully.", if admin account has been successfully created', async () => {
      userToSave.admin = true;

      await request(server)
        .post('/api/user')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(userToSave)
        .expect(201)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('User created successfully.');
        });
    });

    it('should call "presaveValidationHandler" with an err obj and eventually return response with status 422 and json obj with "message" property, being appropriate to data which not match its schema, if any data provided in request payload is not consistent with appropriate schema', async () => {
      const invalidData = [1, 1, 'kamil@', 'short', 'short'];

      for (let i = 0; i < invalidData.length; i++) {
        let user = Object.assign({}, userToSave);

        if (isEqual(i, 0)) user.name = invalidData[i];
        else if (isEqual(i, 1)) user.surname = invalidData[i];
        else if (isEqual(i, 2)) user.email = invalidData[i];
        else if (isEqual(i, 3)) user.password = invalidData[i];
        else if (isEqual(i, 4)) user.confirmPassword = invalidData[i];
        else if (isEqual(i, 5)) user.admin = invalidData[i];

        await request(server)
          .post('/api/user')
          .set('Content-Type', 'application/json')
          .send(user)
          .expect(422)
          .then(({ body: { message } }) => {
            expect(message).to.exist.and.to.be.a('string');
          });
      }
    });

    it('should call "presaveValidationHandler" with an err obj and eventually return response with status 422 and json obj with "message" - \'"admin" must be a boolean\' property, if "admin" property provided in request payload is not consistent with user schema', async () => {
      user.admin = 'notBoolean';

      await request(server)
        .post('/api/user')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(user)
        .expect(422)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('"admin" must be a boolean');
        });
    });

    it('should call "presaveValidationHandler" with an err obj and return response with status 422 and json obj with "message" prop - "Password needs to be identical.", if request contains different "password" and "confirmPass" props', async () => {
      userToSave.confirmPassword = '87654321';

      await request(server)
        .post('/api/user')
        .set('Content-Type', 'application/json')
        .send(userToSave)
        .expect(422)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('Password needs to be identical.');
        });
    });

    it('should call "presaveValidationHandler" with an err obj and return response with status 409 and json obj with "message" prop - "User has been already created.", if the user with same "email" has been already created', async () => {
      await User.insertMany([userToSave]);

      await request(server)
        .post('/api/user')
        .set('Content-Type', 'application/json')
        .send(userToSave)
        .expect(409)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('User has been already created.');
        });
    });

    it('should call "presaveValidationHandler" with an err obj and return response with status 500 and json obj with "message" prop - "Internal bcrypt error - "genSalt" method error.", if bcrypt "genSalt" method throw an exception', async () => {
      const err = new Error('Internal bcrypt error - "genSalt" method error.');
      err.statusCode = 500;
      sinon.stub(bcrypt, 'genSalt').throws(err);

      await request(server)
        .post('/api/user')
        .set('Content-Type', 'application/json')
        .send(userToSave)
        .expect(500)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq(
            'Internal bcrypt error - "genSalt" method error.'
          );
          bcrypt.genSalt.restore();
        });
    });

    it('should call "presaveValidationHandler" with an err obj and return response with status 500 and json obj with "message" prop - "Internal bcrypt error - "hash" method error.", if bcrypt "hash" method throw an exception', async () => {
      const err = new Error('Internal bcrypt error - "hash" method error.');
      err.statusCode = 500;
      sinon.stub(bcrypt, 'hash').throws(err);

      await request(server)
        .post('/api/user')
        .set('Content-Type', 'application/json')
        .send(userToSave)
        .expect(500)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq(
            'Internal bcrypt error - "hash" method error.'
          );
          bcrypt.hash.restore();
        });
    });

    it('should call "presaveValidationHandler" with an err obj and return response with status 500 and json obj with "message" prop - "Internal database error.", if user cannot be saved due to database error', async () => {
      const err = new Error('Internal database error.');
      err.statusCode = 500;
      sinon.stub(mongoose.Model.prototype, 'save').throws(err);

      await request(server)
        .post('/api/user')
        .set('Content-Type', 'application/json')
        .send(userToSave)
        .expect(500)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('Internal database error.');
          mongoose.Model.prototype.save.restore();
        });
    });

    it('should return response with status 401 and json obj with "message" prop - "Could not authenticate!", if "Authentication" header is not present, while trying to create an admin account', async () => {
      userToSave.admin = true;

      await request(server)
        .post('/api/user')
        .set('Content-Type', 'application/json')
        .send(userToSave)
        .expect(401)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('Could not authenticate!');
        });
    });

    it('should return response with status 401 and json obj with "message" prop - "jwt must be provided!", if JWT in the "Authentication" header is not present, while trying to create an admin account', async () => {
      userToSave.admin = true;
      token = '';

      await request(server)
        .post('/api/user')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(userToSave)
        .expect(401)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('jwt must be provided');
        });
    });

    it('should return response with status 401 and json obj with "message" prop - "jwt malformed", if JWT in the "Authentication" header is not valid, while trying to create an admin account', async () => {
      userToSave.admin = true;
      token = 'wrong';

      await request(server)
        .post('/api/user')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(userToSave)
        .expect(401)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('jwt malformed');
        });
    });

    it('should return response with status 403 and json obj with "message" prop - "Not an admin. Access forbidden.", if JWT does not contain an "admin" prop set to "true", while trying to create an admin account', async () => {
      userToSave.admin = true;
      token = jwt.sign(
        { _id: '012345678901234567891234', admin: false },
        config.get('jwtPrivateKey')
      );

      await request(server)
        .post('/api/user')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(userToSave)
        .expect(403)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('Not an admin. Access forbidden.');
        });
    });
  });
});

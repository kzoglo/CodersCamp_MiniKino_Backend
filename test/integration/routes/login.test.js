const bcrypt = require('bcryptjs');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
chai.use(chaiAsPromised);
const expect = chai.expect;
const request = require('supertest');
const { isEqual } = require('../../../predicates');

const { User } = require('../../../models/user');
const initializeDatabase = require('../../../seed/seed');
const { initializeMinIO } = require('../../../bucket/minio');

describe('/api/login', () => {
  let app, name, surname;

  before(async () => {
    name = 'kamil';
    surname = 'kamil';

    app = require('../../../index');

    await initializeDatabase();
    await initializeMinIO();

    await User.deleteMany({});
    await User.insertMany([
      {
        name,
        surname,
        email: 'user1@test.pl',
        password: 'kamilkamil',
        confirmPassword: 'kamilkamil',
      },
      {
        name: 'kamil',
        surname: 'kamil',
        email: 'user2@test.pl',
        password: 'kamilkamil',
        confirmPassword: 'kamilkamil',
      },
    ]);
  });

  sinon.stub(bcrypt, 'compare').callsFake((password, encryptedPass) => {
    return isEqual(password, encryptedPass) ? true : false;
  });

  /*** 'POST /' ***/
  describe('POST /', () => {
    it('should respond with status 200 and json object, that contains token, userId, userName, userSurname, expiresIn, if user was logged in successfully', async () => {
      await request(app)
        .post('/api/login')
        .send({ email: 'user1@test.pl', password: 'kamilkamil' })
        .set('Content-Type', 'application/json')
        .expect(200)
        .then(
          ({ body: { userName, token, userId, userSurname, expiresIn } }) => {
            expect(token, userId, expiresIn, userName, userSurname).to.be.not
              .undefined;
            expect(userName).to.be.eq('kamil');
            expect(userSurname).to.be.eq('kamil');
          }
        );
    });

    it('should call "next" middleware with err object which contains statusCode 422 as an argument, if email, inserted by a user can\'t be validated properly by Joi', async () => {
      await request(app)
        .post('/api/login')
        .send({ email: 'not of an email type', password: 'kamilkamil' })
        .set('Content-Type', 'application/json')
        .expect(422)
        .then(({ body: { message, data } }) => {
          expect(message, data).to.be.not.undefined;
        });
    });

    it('should call "next" middleware with err object which contains statusCode 422 as an argument, if password, inserted by a user can\'t be validated properly by Joi', async () => {
      await request(app)
        .post('/api/login')
        .send({ email: 'email@type.pl', password: 'bad' })
        .set('Content-Type', 'application/json')
        .expect(422)
        .then(({ body: { message, data } }) => {
          expect(message, data).to.be.not.undefined;
        });
    });

    it('should call "next" middleware with err object which contains statusCode 422 as an argument, if both email and password, inserted by a user can\'t be validated properly by Joi', async () => {
      await request(app)
        .post('/api/login')
        .send({ email: 'not of an email type', password: 'bad' })
        .set('Content-Type', 'application/json')
        .expect(422)
        .then(({ body: { message, data } }) => {
          expect(message, data).to.be.not.undefined;
        });
    });

    it('should call "next" middleware with err object as an argument, which contains statusCode 401 and message "Invalid email", if an email inserted by an user is not valid', async () => {
      await request(app)
        .post('/api/login')
        .send({ email: 'wrong@email.pl', password: 'kamilkamil' })
        .set('Content-Type', 'application/json')
        .expect(401)
        .then(({ body: { message, data } }) => {
          expect(message, data).to.be.not.undefined;
          expect(message).to.be.eq('Invalid email.');
        });
    });

    it('should call "next" middleware with err object as an argument, which contains statusCode 401 and message "Invalid password", if a password inserted by an user is not valid', async () => {
      await request(app)
        .post('/api/login')
        .send({ email: 'user2@test.pl', password: 'kamilkamilkamil' })
        .set('Content-Type', 'application/json')
        .expect(401)
        .then(({ body: { message, data } }) => {
          expect(message, data).to.be.not.undefined;
          expect(message).to.be.eq('Invalid password.');
        });
    });
  });
});

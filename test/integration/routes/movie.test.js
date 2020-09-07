const mongoose = require('mongoose');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;
const request = require('supertest');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const config = require('config');

const { Movie } = require('../../../models/movie');

describe('/api/movie', () => {
  const moviePostersNames = {
    alladyn: 'alladyn',
    avengers: 'avengers',
    gemini_man: 'gemini_man',
    it_2: 'it_2',
    jak_wytresowac_smoka_3: 'jak_wytresowac_smoka_3',
    joker: 'joker',
    jumanji: 'jumanji',
    kapitan_marvel: 'kapitan_marvel',
    kraina_lodu_2: 'kraina_lodu_2',
    pewnego_razu_w_hollywood: 'pewnego_razu_w_hollywood',
    slimaczki: 'slimaczki',
    split: 'split',
    star_wars: 'star_wars',
  };
  let server;
  let moviesDocs;
  let token = jwt.sign({ admin: true }, config.get('jwtPrivateKey'));

  before(() => {
    server = require('../../../index');
  });

  after(() => {
    server.close();
  });

  beforeEach(async () => {
    const {
      jumanji,
      pewnego_razu_w_hollywood,
      split,
      gemini_man,
    } = moviePostersNames;

    moviesDocs = [
      {
        _id: '012345678901234567891234',
        title: 'Dogs',
        year: 2000,
        genre: 'comedy',
        description: 'Funny movie about dogs.',
        imageUrl: `images/movies/${jumanji}.jpg`,
        __v: 0,
      },
      {
        _id: '012345678901234567891233',
        title: 'Cats',
        year: 1980,
        genre: 'thriller',
        description: 'Scary piece of cinematography.',
        imageUrl: `images/movies/${pewnego_razu_w_hollywood}.jpg`,
        __v: 0,
      },
      {
        _id: '012345678901234567891232',
        title: 'Hogs',
        year: 2020,
        genre: 'drama',
        description: 'Heartbreaking movie about longing for a pack of pigs.',
        imageUrl: `images/movies/${split}.jpg`,
        __v: 0,
      },
      {
        _id: '012345678901234567891231',
        title: 'Mice',
        year: 2010,
        genre: 'sci-fi',
        description: 'Movie about little critters.',
        imageUrl: `images/movies/${gemini_man}.jpg`,
        __v: 0,
      },
    ];
    await Movie.insertMany(moviesDocs);
  });

  afterEach(async () => {
    await Movie.deleteMany({});
  });

  /*** 'GET /' ***/
  describe('GET /', () => {
    it('should return response with status code of 200 and all available movies', async () => {
      await request(server)
        .get('/api/movie')
        .set('Content-Type', 'application/json')
        .expect(200, moviesDocs);
    });

    it('should call "next" middleware with an error obj as an argument, "next" will call error handling middleware which will return response with status 404 and message "No movies found."', async () => {
      await Movie.deleteMany({});

      await request(server)
        .get('/api/movie')
        .set('Content-Type', 'application/json')
        .expect(404)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('No movies found.');
        });
    });
  });

  /*** 'GET /:id' ***/
  describe('GET /:id', () => {
    it('should return response with status code of 200 and all available movies', async () => {
      await request(server)
        .get(`/api/movie/${moviesDocs[0]._id}`)
        .set('Content-Type', 'application/json')
        .expect(200, moviesDocs[0]);
    });

    it('should call "next" middleware with an error obj as an argument, "next" will call error handling middleware which will return response with status 404 and message "Movie not found."', async () => {
      await Movie.deleteMany({});

      await request(server)
        .get(`/api/movie/${moviesDocs[0]._id}`)
        .set('Content-Type', 'application/json')
        .expect(404)
        .then(({ body: { message } }) => {
          expect(message).to.be.eq('Movie not found.');
        });
    });
  });

  /*** 'POST /' ***/
  describe('POST /', () => {
    it('should return response with status code of 201 and json object with prop "message" - "Movie created successfully"', async () => {
      const { title, year, genre, description, imageUrl } = moviesDocs[0];
      const movie = { title, year, genre, description, imageUrl };
      await Movie.deleteMany({});

      await request(server)
        .post('/api/movie')
        .send(movie)
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .expect(201, { message: 'Movie created successfully.' });
    });

    it('should return response with status of 422 and json object with prop "message" - "\'title\' is required", if "title" property or no property is attached with req', async () => {
      const movie = {};
      await Movie.deleteMany({});

      await request(server)
        .post('/api/movie')
        .send(movie)
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .expect(422, { message: '"title" is required' });
    });

    it('should return response with status of 422 and json object with prop "message" - "\'year\' is required", if "year" property is not attached with req', async () => {
      const movie = { title: 'something' };
      await Movie.deleteMany({});

      await request(server)
        .post('/api/movie')
        .send(movie)
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .expect(422, { message: '"year" is required' });
    });

    it('should return response with status of 422 and json object with prop "message" - "\'genre\' is required", if "genre" property is not attached with req', async () => {
      const movie = { title: 'something', year: 2000 };
      await Movie.deleteMany({});

      await request(server)
        .post('/api/movie')
        .send(movie)
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .expect(422, { message: '"genre" is required' });
    });

    it('should return response with status of 422 and json object with prop "message" - "\'description\' is required", if "description" property is not attached with req', async () => {
      const movie = { title: 'something', year: 2000, genre: 'something' };
      await Movie.deleteMany({});

      await request(server)
        .post('/api/movie')
        .send(movie)
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .expect(422, { message: '"description" is required' });
    });

    it('should return response with status of 422 and json object with prop "message" - "\'imageUrl\' is required", if "imageUrl" property is not attached with req', async () => {
      const movie = {
        title: 'something',
        year: 2000,
        genre: 'something',
        description: 'something about movie',
      };
      await Movie.deleteMany({});

      await request(server)
        .post('/api/movie')
        .send(movie)
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .expect(422, { message: '"imageUrl" is required' });
    });

    it('should return response with status of 409 and json object with prop "message" - "Movie has been already created.", if admin tries to create movie already existing in db', async () => {
      const { title, year, genre, description, imageUrl } = moviesDocs[0];
      const movie = { title, year, genre, description, imageUrl };

      await request(server)
        .post('/api/movie')
        .send(movie)
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .expect(409, { message: 'Movie has been already created.' });
    });

    it("should return response with status of 500 and json object with prop 'message' - \"'title' is required\", if document can not be saved due to Model's validation error", async () => {
      await Movie.deleteMany({});
      const { title, year, genre, description, imageUrl } = moviesDocs[0];
      const movie = { title, year, genre, description, imageUrl };
      const message = "'title' is required";
      const err = new Error(message);
      err.statusCode = 422;
      sinon.stub(mongoose.Document.prototype, 'validate').throws(err);

      await request(server)
        .post('/api/movie')
        .send(movie)
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .expect(422, { message })
        .then((res) => {
          mongoose.Document.prototype.validate.restore();
        });
    });

    it('should return response with status of 500 and json object with prop "message" - "Database Error - document can not be created.", if document can not be saved due to database error', async () => {
      await Movie.deleteMany({});
      const { title, year, genre, description, imageUrl } = moviesDocs[0];
      const movie = { title, year, genre, description, imageUrl };
      const message = 'Database Error - document can not be created.';
      sinon.stub(mongoose.Model.prototype, 'save').throws(new Error(message));

      await request(server)
        .post('/api/movie')
        .send(movie)
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .expect(500, { message })
        .then(() => {
          mongoose.Model.prototype.save.restore();
        });
    });

    it('should return response with status of 401 and json object with prop "message" - "Could not authenticate.", if the "Authorization" header is not set.', async () => {
      await request(server)
        .post('/api/movie')
        .send({})
        .set('Authorization', '')
        .set('Content-Type', 'application/json')
        .expect(401, { message: 'Could not authenticate!' });
    });

    it('should return response with status of 401 and json object with prop "message" - "jwt must be provided", if the "Authorization" header doesn\'t contain JWT.', async () => {
      token = '';

      await request(server)
        .post('/api/movie')
        .send({})
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .expect(401, { message: 'jwt must be provided' });
    });

    it('should return response with status of 401 and json object with prop "message" - "jwt malformed", if the "Authorization" header contains JWT which was malformed.', async () => {
      token = 'malformedJWT';

      await request(server)
        .post('/api/movie')
        .send({})
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .expect(401, { message: 'jwt malformed' });
    });

    it('should return response with status of 403 and json object with prop "message" - "Not an admin. Access forbidden.", if req.admin prop is falsy', async () => {
      token = jwt.sign({ admin: false }, config.get('jwtPrivateKey'));

      await request(server)
        .post('/api/movie')
        .send({})
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .expect(403, { message: 'Not an admin. Access forbidden.' });
    });
  });
});

const { Movie, joiValidate } = require('../models/movie');
const handleErrors = require('../assistive_functions/handleErrors');
const presaveValidationHandler = require('../assistive_functions/presaveValidationHandler');
const joiValidation = require('../assistive_functions/joiValidation');
const checkForExistingDoc = require('../assistive_functions/checkForExistingDoc');
const { isEqual } = require('../predicates');

/*** Movies Handlers ***/
module.exports.getMovies = async (req, res, next) => {
  try {
    const movies = await Movie.find();
    if (isEqual(movies.length, 0)) {
      handleErrors('No movies found.', 404);
    }

    res.status(200).json(movies);
  } catch (err) {
    next(err);
  }
};

module.exports.getMovie = async ({ params: { id } }, res, next) => {
  try {
    const movie = await Movie.findById(id);
    if (!movie) {
      handleErrors('Movie not found.', 404);
    }
    res.status(200).json(movie);
  } catch (err) {
    next(err);
  }
};

module.exports.postMovie = async ({ body }, res, next) => {
  try {
    const { title, year, genre, description, imageUrl } = joiValidation(
      joiValidate,
      body
    );

    await checkForExistingDoc(
      { title, year, genre, description, imageUrl },
      Movie
    );
    const movie = new Movie({
      title,
      year,
      genre,
      description,
      imageUrl,
    });

    await movie.validate();

    await movie.save();
    res.status(201).json({ message: 'Movie created successfully.' });
  } catch (err) {
    presaveValidationHandler(err, next);
  }
};

import {Movie,joiValidate} from '../models/movie';
import handleErrors from '../assistive_functions/handleErrors';
import presaveValidationHandler from '../assistive_functions/presaveValidationHandler';
import joiValidation from '../assistive_functions/joiValidation';
import checkForExistingDoc from '../assistive_functions/checkForExistingDoc';
import {isEqual} from '../predicates';

/*** Movies Handlers ***/
export const getMovies = async (req, res, next) => {
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

export const getMovie = async ({ params: { id } }, res, next) => {
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

export const postMovie = async ({ body }, res, next) => {
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

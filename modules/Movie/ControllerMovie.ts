import { RequestHandler } from 'express';
import * as types from './types';
import RepoMovie from './RepoMovie';
import { presaveValidationHandler } from '../../assistive_functions/presaveValidationHandler';
import ValidatorMovie from './valid';

class ControllerMovie {
  private _repo: RepoMovie;
  private _validator: ValidatorMovie;
  
  get validator() {
    if(!this._validator) this._validator = new ValidatorMovie();
    return this._validator;
  }
  get repo() {
    if(!this._repo) this._repo = new RepoMovie();
    return this._repo;
  }

  getMovies: RequestHandler<any, types.IMovieDocumentLean[]> = async (req, res, next) => {
    try {
      const movies = await this.repo.loadMoviesLean();
      res.status(200).json(movies);
    } catch (err) {
      next(err);
    }
  };
  
  getMovie: RequestHandler<types.IMovieParamsGetMovie, types.IMovieDocumentLean> = async (req, res, next) => {
    try {
      const movie = await this.repo.loadMovieLean(req.params);
      res.status(200).json(movie);
    } catch (err) {
      next(err);
    }
  };
  
  postMovie: RequestHandler<any, types.IMovieRespPostMovie, types.IMovieCreate> = async (req, res, next) => {
    try {
      const validated = this.validator.specific.postMovie(req);
      await this.repo.create(validated);
      res.status(201).json({ message: 'Movie created successfully.' });
    } catch (err) {
      presaveValidationHandler(err, next);
    }
  };
}

export function ControllerMovieFactory() {
  return new ControllerMovie();
}
export default ControllerMovie;

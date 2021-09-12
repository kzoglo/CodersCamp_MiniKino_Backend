import * as types from './types'; 
import { Movie } from './model';
import { checkForExistingDoc } from '../../assistive_functions/checkForExistingDoc';
import assureSuccessfulLoad from '../../assistive_functions/assureSuccessfulLoad';

class RepoMovie implements types.IRepoMovie {
  assureSuccessfulMovieLoad(data: types.IMovieDocumentLean[] | types.IMovieDocumentLean) {
    assureSuccessfulLoad(data);
  }

  async create(body: types.IMovieCreate): Promise<void> {
    await checkForExistingDoc({ title: body.title }, Movie);
    const movie = new Movie(body);
    await movie.save();
  }

  async loadMoviesLean(): Promise<types.IMovieDocumentLean[]> {
    const movies = await Movie.find().lean().exec();
    this.assureSuccessfulMovieLoad(movies);
    return movies;
  }

  async loadMovieLean(params: Pick<types.IMovieParamsGetMovie, 'id'>): Promise<types.IMovieDocumentLean> {
    const movie = await Movie.findById(params.id).lean().exec();
    this.assureSuccessfulMovieLoad(movie);
    return movie;
  }

}

export default RepoMovie;

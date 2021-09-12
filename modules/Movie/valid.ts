import { NextFunction, Request, Response } from 'express';
import RequestValidator from '../../tools/validator/Validator';
import { IMovieCreate, IValidateGetMovie, IOverloadValidatePostMovieSpecific, IOverloadValidatePostMovieGeneric } from './types';

//TODO - mayby generic interface to implement
class ValidatorMovie {
  private specificBool: boolean = false;
  private genericBool: boolean = false;

  get specific() {
    this.specificBool = true;
    return {
      postMovie: this.validatePostMovie.bind(this) as IOverloadValidatePostMovieSpecific,
    };
  }

  get generic() {
    this.genericBool = true;
    return {
      getMovie: this.validateGetMovie,
      postMovie: this.validatePostMovie.bind(this) as IOverloadValidatePostMovieGeneric,
    };
  }

  validateGetMovie: IValidateGetMovie = (req, res, next) => {
    const id = req.params.id.toString();
    if (this.genericBool) {
      new RequestValidator(id).withoutSanitation.isLength().isMongoId();
      
      next();
    }
  }
  
  private validatePostMovie(req: Request<any, any, IMovieCreate>): IMovieCreate;
  private validatePostMovie(req: Request<any, any, IMovieCreate>, res: Response, next: NextFunction): void;
  private validatePostMovie(req: Request<any, any, IMovieCreate>, res?: Response, next?: NextFunction) {
    const { description, genre, imageUrl, title, year } = req.body;
    if (this.genericBool) {
      new RequestValidator(description).withoutSanitation.isLength();
      new RequestValidator(genre).withoutSanitation.isLength();
      new RequestValidator(imageUrl).withoutSanitation.isLength();
      new RequestValidator(title).withoutSanitation.isLength();
      new RequestValidator(year).withoutSanitation.isInteger();
    
      next();
    }
    if (this.specificBool) {
      const validated: IMovieCreate = {
        description: new RequestValidator<typeof description>(description).withSanitation.trimAll().isLength().result,
        genre: new RequestValidator<typeof genre>(genre).withSanitation.trimAll().isLength().result,
        title: new RequestValidator<typeof title>(title).withSanitation.trimAll().isLength().result,
        imageUrl: new RequestValidator<typeof imageUrl>(imageUrl).withSanitation.trimAll().isLength().result,
        year: new RequestValidator<typeof year>(year).withoutSanitation.isInteger().result,
      };
      
      return validated;
    }
  }
}

export function validatorMovieFactory() {
  return new ValidatorMovie();
}
export default ValidatorMovie; 

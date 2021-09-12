import { Types, Document } from "mongoose";
import { IRepo } from '../../types/Repo';
import { Genres } from './enums';
import { Request, Response, NextFunction } from 'express';

type Genre = `${Genres}`;

export interface IMovieCreate {
  title: string;
  year: number;
  genre: Genre;
  description: string;
  imageUrl: string;
}

export interface IMovieDocumentLean extends IMovieCreate {
  _id: Types.ObjectId;
}

export interface IMovieDocument extends IMovieDocumentLean, Document {
  _id: Types.ObjectId;
}

export interface IMovieRespPostMovie {
  message: string;
}

export interface IMovieParamsGetMovie {
  id: Types.ObjectId;
}

export interface IRepoMovie extends IRepo<IMovieCreate> {
  loadMoviesLean(): Promise<IMovieDocumentLean[]>;
  loadMovieLean(params: Pick<IMovieParamsGetMovie, 'id'>): Promise<IMovieDocumentLean>;
}

export interface IOverloadValidatePostMovieGeneric {
  (req: Request<any, any, IMovieCreate>, res: Response, next: NextFunction): void;
}

export interface IOverloadValidatePostMovieSpecific {
  (req: Request<any, any, IMovieCreate>): IMovieCreate;
}

export type IValidateGetMovie = {
  (req: Request<IMovieParamsGetMovie>, res: Response, next: NextFunction): void
}

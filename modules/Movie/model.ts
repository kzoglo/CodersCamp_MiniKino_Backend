import { IMovieDocument, IMovieDocumentLean } from './types';
import { Genres } from './enums';

import Joi from 'joi';
import { model, Schema } from 'mongoose';
import {removeMongoVersion} from '../../tools/middlewares';

/*** Schema and Model ***/
const movieSchema = new Schema({
  title: {
    type: String,
    trim: true,
    minlength: 1,
    maxlength: 100,
    required: true,
  },
  year: {
    type: Number,
    min: 1895,
    max: new Date().getFullYear(),
    required: true,
  },
  genre: {
    type: String,
    enum: Object.values(Genres),
    trim: true,
    minlength: 1,
    maxlength: 100,
    required: true,
  },
  description: {
    type: String,
    trim: true,
    minlength: 8,
    maxlength: 500,
    required: true,
  },
  imageUrl: {
    type: String,
    trim: true,
    minlength: 1,
    maxlength: 100,
    required: true,
  },
});

movieSchema.post('find', removeMongoVersion);
movieSchema.post('findOne', removeMongoVersion);

export const Movie = model<IMovieDocument>('Movie', movieSchema);
Movie.modelName = 'Movie';

// /*** JOI Validation ***/
// export const validateMovie = (movie) => {
//   const movieJoiSchema = Joi.object({
//     title: Joi.string().trim().min(1).max(100).required(),
//     year: Joi.number().min(1895).max(new Date().getFullYear()).required(),
//     genre: Joi.string().trim().min(1).max(100).required(),
//     description: Joi.string().trim().min(8).max(500).required(),
//     imageUrl: Joi.string().trim().min(1).max(100).required(),
//   });

//   return movieJoiSchema.validate(movie);
// }

// module.exports.joiValidate = validateMovie;
// module.exports.Movie = Movie;

import mongoose from 'mongoose';
import Joi from 'joi';

//TODO
Joi.objectId = require('joi-objectid')(Joi);

import {Movie} from './movie';
import {Room} from './room';
import {validateId,validationMsg} from '../assistive_functions/validateId';

/*** Schema and Model ***/
const screeningSchema = new mongoose.Schema({
  movie_id: {
    type: mongoose.Schema.Types.ObjectId,
    validate: [
      async (value) => await validateId(value, Movie),
      validationMsg(Movie),
    ],
    ref: 'Movie',
    required: true,
  },
  room_id: {
    type: mongoose.Schema.Types.ObjectId,
    validate: [
      async (value) => await validateId(value, Room),
      validationMsg(Room),
    ],
    ref: 'Room',
    required: true,
  },
  time: {
    type: Date,
    required: true,
  },
});
export const Screening = mongoose.model('Screening', screeningSchema)
Screening.modelName = 'Screening';

/*** JOI Validation ***/
const validateScreening = (screening) => {
  const screeningJoiSchema = Joi.object({
    movie_id: Joi.objectId().required(),
    room_id: Joi.objectId().required(),
    time: Joi.date().required(),
  });

  return screeningJoiSchema.validate(screening);
}

// module.exports.joiValidate = validateScreening;
// module.exports.Screening = Screening;

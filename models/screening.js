const mongoose = require('mongoose');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const { Movie } = require('./movie');
const { Room } = require('./room');
const {
  validateId,
  validationMsg,
} = require('../assistive_functions/validateId');

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
const Screening = mongoose.model('Screening', screeningSchema);
Screening.modelName = 'Screening';

/*** JOI Validation ***/
function validateScreening(screening) {
  const screeningJoiSchema = Joi.object({
    movie_id: Joi.objectId().required(),
    room_id: Joi.objectId().required(),
    time: Joi.date().required(),
  });

  return screeningJoiSchema.validate(screening);
}

module.exports.joiValidate = validateScreening;
module.exports.Screening = Screening;

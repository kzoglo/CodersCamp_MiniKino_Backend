const mongoose = require('mongoose');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const { User } = require('./user');
const { Seat } = require('./seat');
const { Screening } = require('./screening');
const {
  validateId,
  validationMsg,
} = require('../assistive_functions/validateId');

/*** Schema and Model ***/
const reservationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    validate: [
      async (value) => await validateId(value, User),
      validationMsg(User),
    ],
    ref: 'User',
    required: true,
  },
  seat_id: {
    type: mongoose.Schema.Types.ObjectId,
    validate: [
      async (value) => await validateId(value, Seat),
      validationMsg(Seat),
    ],
    ref: 'Seat',
    required: true,
  },
  screening_id: {
    type: mongoose.Schema.Types.ObjectId,
    validate: [
      async (value) => await validateId(value, Screening),
      validationMsg(Screening),
    ],
    ref: 'Screening',
    required: true,
  },
});
const Reservation = mongoose.model('Reservation', reservationSchema);
Reservation.modelName = 'Reservation';

/*** JOI Validation ***/
function validateReservation(reservation) {
  const reservationJoiSchema = Joi.object({
    user_id: Joi.objectId().required(),
    seat_id: Joi.objectId().required(),
    screening_id: Joi.objectId().required(),
  });

  return reservationJoiSchema.validate(reservation);
}

module.exports.joiValidate = validateReservation;
module.exports.Reservation = Reservation;

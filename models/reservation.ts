import mongoose from 'mongoose';
import Joi from 'joi';
//TODO
Joi.objectId = require('joi-objectid')(Joi);

import {User} from './user';
import {Seat} from './seat';
import {Screening} from './screening';
import {validateId,validationMsg} from '../assistive_functions/validateId';

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
export const Reservation = mongoose.model('Reservation', reservationSchema);
Reservation.modelName = 'Reservation';

/*** JOI Validation ***/
export const validateReservation = (reservation) => {
  const reservationJoiSchema = Joi.object({
    user_id: Joi.objectId().required(),
    seat_id: Joi.objectId().required(),
    screening_id: Joi.objectId().required(),
  });

  return reservationJoiSchema.validate(reservation);
}

// module.exports.joiValidate = validateReservation;
// module.exports.Reservation = Reservation;

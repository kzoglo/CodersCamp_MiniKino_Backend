import mongoose from 'mongoose';
import Joi from 'joi';
import objectId from 'joi-objectid';

//TODO
Joi.objectId = objectId(Joi);

import {Room} from './room';
import {validateId,validationMsg} from '../assistive_functions/validateId';

/*** Schema and Model ***/
const seatSchema = new mongoose.Schema({
  room_id: {
    type: mongoose.Schema.Types.ObjectId,
    validate: [
      async (value) => await validateId(value, Room),
      validationMsg(Room),
    ],
    ref: 'Room',
    required: true,
  },
  row: {
    type: Number,
    min: 1,
    max: 99,
    required: true,
  },
  seatNumber: {
    type: Number,
    min: 1,
    max: 99,
    required: true,
  },
});

export const Seat = mongoose.model('Seat', seatSchema)
Seat.modelName = 'Seat';

/*** JOI Validation ***/
export const validateSeat = (seat) => {
  const seatJoiSchema = Joi.object({
    room_id: Joi.objectId().required(),
    row: Joi.number().min(1).max(99).required(),
    seatNumber: Joi.number().min(1).max(99).required(),
  });

  return seatJoiSchema.validate(seat);
}

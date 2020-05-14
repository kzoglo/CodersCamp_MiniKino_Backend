const mongoose = require('mongoose');

const { Seat, joiValidate } = require('../models/seat');
const handleErrors = require('../assistive_functions/handleErrors');
const presaveValidationHandler = require('../assistive_functions/presaveValidationHandler');
const joiValidation = require('../assistive_functions/joiValidation');
const checkForExistingDoc = require('../assistive_functions/checkForExistingDoc');

/*** Seat Handlers ***/
module.exports.getSeats = async (req, res, next) => {
  try {
    const seats = await Seat.find().populate({
      path: 'room_id',
      select: 'name -_id',
    });

    res.status(200).json(seats);
  } catch (err) {
    next(err);
  }
};

module.exports.getRoomSeats = async ({ params: { room_id } }, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(room_id))
      handleErrors('Invalid req parameters data.', 422);

    const seats = await Seat.find({ room_id }).populate({
      path: 'room_id',
      select: 'name -_id',
    });

    res.status(200).json(seats);
  } catch (err) {
    next(err);
  }
};

module.exports.getSeat = async (
  { params: { room_id, row, seatNumber } },
  res,
  next
) => {
  try {
    const seat = await Seat.findOne({ room_id, row, seatNumber });
    if (!seat) handleErrors('Seat not found.', 404);

    res.status(200).json(seat);
  } catch (err) {
    next(err);
  }
};

module.exports.postSeat = async ({ body }, res, next) => {
  try {
    const { room_id, row, seatNumber } = joiValidation(joiValidate, body);
    await checkForExistingDoc({ room_id, row, seatNumber }, Seat);

    const seat = new Seat({
      room_id,
      row,
      seatNumber,
    });

    await seat.validate();

    await seat.save();
    res.status(201).json({ message: 'Seat was successfully created.' });
  } catch (err) {
    presaveValidationHandler(err, next);
  }
};

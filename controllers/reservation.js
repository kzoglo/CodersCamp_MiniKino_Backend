const mongoose = require('mongoose');

const { isEqual, isInequal } = require('../predicates');
const { Reservation, joiValidate } = require('../models/reservation');
const handleErrors = require('../assistive_functions/handleErrors');
const presaveValidationHandler = require('../assistive_functions/presaveValidationHandler');
const joiValidation = require('../assistive_functions/joiValidation');
const checkForExistingDoc = require('../assistive_functions/checkForExistingDoc');

/*** Reservation Handlers ***/
module.exports.getReservations = async (
  { user_id: decodedUserId, params: { user_id, screening_id } },
  res,
  next
) => {
  let reservations;

  try {
    if (mongoose.Types.ObjectId.isValid(user_id)) {
      if (isEqual(user_id, decodedUserId)) {
        reservations = await Reservation.find({ user_id })
          .populate({
            path: 'seat_id',
            populate: { path: 'room_id' },
          })
          .populate({
            path: 'screening_id',
            populate: { path: 'movie_id' },
          });
      } else {
        handleErrors(
          "Not authorized. You're trying to access resource you do not have permission to.",
          403
        );
      }
    } else {
      reservations = await Reservation.find({ screening_id })
        .select('seat_id')
        .populate({
          path: 'seat_id',
          select: 'row seatNumber',
        });
    }

    res.status(200).json(reservations);
  } catch (err) {
    next(err);
  }
};

module.exports.postReservation = async (
  { user_id: decodedUserId, body },
  res,
  next
) => {
  try {
    const { user_id, seat_id, screening_id } = joiValidation(joiValidate, body);

    if (isInequal(decodedUserId, user_id))
      handleErrors('You do not have access to the requested resource.', 403);

    await checkForExistingDoc(
      {
        seat_id,
        screening_id,
      },
      Reservation
    );

    let reservation = new Reservation({
      user_id,
      seat_id,
      screening_id,
    });

    await reservation.validate();

    await reservation.save();
    res.status(201).json({ message: 'Successful reservation.' });
  } catch (err) {
    presaveValidationHandler(err, next);
  }
};

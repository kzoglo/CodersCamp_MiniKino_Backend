const mongoose = require('mongoose');

const { Screening, joiValidate } = require('../models/screening');
const handleErrors = require('../assistive_functions/handleErrors');
const presaveValidationHandler = require('../assistive_functions/presaveValidationHandler');
const joiValidation = require('../assistive_functions/joiValidation');
const checkForExistingDoc = require('../assistive_functions/checkForExistingDoc');
const { isEqual } = require('../predicates');

/*** Screening Handlers ***/
module.exports.getScreenings = async (req, res, next) => {
  try {
    const screenings = await Screening.find();
    if (isEqual(screenings.length, 0))
      handleErrors('No screenings found!', 404);
    res.status(200).json(screenings);
  } catch (err) {
    next(err);
  }
};

module.exports.getScreening = async (
  { params: { movie_id, screening_id } },
  res,
  next
) => {
  try {
    if (mongoose.Types.ObjectId.isValid(screening_id)) {
      const screening = await Screening.findById(screening_id).populate({
        path: 'room_id',
      });
      if (!screening) handleErrors('Screening not found!', 404);
      res.status(200).json(screening);
    } else {
      const screenings = await Screening.find({ movie_id }).populate({
        path: 'room_id',
      });
      res.status(200).json(screenings);
    }
  } catch (err) {
    next(err);
  }
};

module.exports.postScreening = async ({ body }, res, next) => {
  try {
    const { movie_id, room_id, time } = joiValidation(joiValidate, body);
    await checkForExistingDoc({ room_id, time }, Screening);

    const screening = new Screening({
      movie_id,
      room_id,
      time,
    });

    await screening.validate();

    await screening.save();
    res.status(201).json({ message: 'Screening created successfully.' });
  } catch (err) {
    presaveValidationHandler(err, next);
  }
};

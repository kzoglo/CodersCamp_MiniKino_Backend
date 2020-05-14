const { Room, joiValidate } = require('../models/room');
const presaveValidationHandler = require('../assistive_functions/presaveValidationHandler');
const joiValidation = require('../assistive_functions/joiValidation');
const checkForExistingDoc = require('../assistive_functions/checkForExistingDoc');

/*** Room Handlers ***/
module.exports.postRoom = async ({ body }, res, next) => {
  try {
    const { name } = joiValidation(joiValidate, body);
    await checkForExistingDoc({ name }, Room);

    const room = new Room({
      name,
    });

    await room.validate();

    await room.save();
    res.status(201).json({ message: 'Room successfully created.' });
  } catch (err) {
    presaveValidationHandler(err, next);
  }
};

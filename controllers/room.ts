import {Room,joiValidate} from '../models/room';
import presaveValidationHandler from '../assistive_functions/presaveValidationHandler';
import joiValidation from '../assistive_functions/joiValidation';
import checkForExistingDoc from '../assistive_functions/checkForExistingDoc';

/*** Room Handlers ***/
export const postRoom = async ({ body }, res, next) => {
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

import bcrypt from 'bcryptjs';

import {isEqual} from '../predicates';
import {User,joiValidate} from '../models/user';
import handleErrors from '../assistive_functions/handleErrors';
import presaveValidationHandler from '../assistive_functions/presaveValidationHandler';
import joiValidation from '../assistive_functions/joiValidation';
import checkForExistingDoc from '../assistive_functions/checkForExistingDoc';

/*** User Handlers ***/
export const postUser = async ({ body }, res, next) => {
  try {
    const {
      name,
      surname,
      email,
      password,
      confirmPassword,
      admin,
    } = joiValidation(joiValidate, body);

    if (!isEqual(password, confirmPassword)) {
      handleErrors('Password needs to be identical.', 422);
    }

    await checkForExistingDoc({ email }, User);

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      surname,
      email,
      password: hashedPass,
      admin,
    });

    await newUser.validate();

    await newUser.save();

    res.status(201).json({ message: 'User created successfully.' });
  } catch (err) {
    presaveValidationHandler(err, next);
  }
};

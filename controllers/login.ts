import bcrypt from 'bcryptjs';
import Joi from 'joi';

import {User,tokenExpiresIn} from '../models/user';
import handleErrors from '../assistive_functions/handleErrors';
import joiValidation from '../assistive_functions/joiValidation';

/*** Joi Validation ***/
const joiValidate = (loginData) => {
  const loginSchema = Joi.object({
    email: Joi.string().lowercase().max(255).required().email(),
    password: Joi.string().min(8).max(255).required(),
  });

  return loginSchema.validate(loginData, { convert: false });
};

/*** Login Handlers ***/
export const login = async ({ body }, res, next) => {
  try {
    const { email, password } = joiValidation(joiValidate, body);

    const user = await User.findOne({ email });
    if (!user) handleErrors('Invalid email.', 401);
    const { _id, name, surname, password: encryptedPass } = user;

    const validPassword = await bcrypt.compare(password, encryptedPass);

    if (!validPassword) handleErrors('Invalid password.', 401);

    const token = user.generateAuthToken();

    res.status(200).json({
      token,
      userId: _id.toString(),
      userName: name,
      userSurname: surname,
      expiresIn: tokenExpiresIn,
    });
  } catch (err) {
    next(err);
  }
};

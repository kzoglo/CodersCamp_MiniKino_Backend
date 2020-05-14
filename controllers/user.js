const bcrypt = require('bcryptjs');

const { isInequal } = require('../predicates');
const { User, joiValidate } = require('../models/user');
const handleErrors = require('../assistive_functions/handleErrors');
const presaveValidationHandler = require('../assistive_functions/presaveValidationHandler');
const joiValidation = require('../assistive_functions/joiValidation');
const checkForExistingDoc = require('../assistive_functions/checkForExistingDoc');

/*** User Handlers ***/
module.exports.postUser = async ({ body }, res, next) => {
  try {
    const {
      name,
      surname,
      email,
      password,
      confirmPassword,
      admin,
    } = joiValidation(joiValidate, body);

    if (isInequal(password, confirmPassword)) {
      handleErrors('Password needs to be identical', 422);
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

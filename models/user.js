const Joi = require('@hapi/joi');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');

/*** Variables ***/
const tokenExpiresIn = 3600000;

/*** Schema and Model ***/
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    minlength: 3,
    maxlength: 255,
    required: true,
  },
  surname: {
    type: String,
    trim: true,
    minlength: 3,
    maxlength: 255,
    required: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    max: 255,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    trim: true,
    min: 8,
    max: 255,
    required: true,
  },
  confirmPassword: {
    type: String,
    trim: true,
    min: 8,
    max: 255,
  },
  admin: {
    type: Boolean,
    default: false,
  },
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { email: this.email, _id: this._id.toString(), admin: this.admin },
    config.get('jwtPrivateKey'),
    { expiresIn: `${tokenExpiresIn}ms` }
  );
  return token;
};

const User = mongoose.model('User', userSchema);
User.modelName = 'User';

/*** JOI Validation ***/
function validateUser(user) {
  const userJoiSchema = Joi.object({
    name: Joi.string().trim().min(3).max(255).required(),
    surname: Joi.string().trim().min(3).max(255).required(),
    email: Joi.string()
      .lowercase()
      .max(255)
      .required()
      .email({ tlds: { allow: false } }),
    password: Joi.string().trim().min(8).max(255).required(),
    confirmPassword: Joi.string().trim().min(8).max(255),
    admin: Joi.boolean().default(false),
  });

  return userJoiSchema.validate(user);
}

exports.tokenExpiresIn = tokenExpiresIn;
exports.User = User;
exports.joiValidate = validateUser;

import Joi from 'joi';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import config from 'config';

/*** Variables ***/
export const tokenExpiresIn = 3600000;

/*** Schema and Model ***/
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    minlength: 3,
    maxlength: 255,
    match: /^[A-Ż]?[a-ż]*$/,
    required: true,
  },
  surname: {
    type: String,
    trim: true,
    minlength: 3,
    maxlength: 255,
    match: /(^[A-Za-ż][']?[A-Z]?[a-ż]+[-|\s]?[A-Za-ż]+$)/,
    required: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    max: 255,
    match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
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

export const User = mongoose.model('User', userSchema)
User.modelName = 'User';

/*** JOI Validation ***/
export const validateUser = (user) => {
  const userJoiSchema = Joi.object({
    name: Joi.string()
      .trim()
      .min(3)
      .max(255)
      .pattern(/^[A-Ż]?[a-ż]*$/)
      .required(),
    surname: Joi.string()
      .trim()
      .min(3)
      .max(255)
      .pattern(/(^[A-Za-ż][']?[A-Z]?[a-ż]+[-|\s]?[A-Za-ż]+$)/)
      .required(),
    email: Joi.string()
      .lowercase()
      .max(255)
      .required()
      .email({ tlds: { allow: true } }),
    password: Joi.string().trim().min(8).max(255).required(),
    confirmPassword: Joi.string().trim().min(8).max(255),
    admin: Joi.boolean().default(false),
  });

  return userJoiSchema.validate(user);
}

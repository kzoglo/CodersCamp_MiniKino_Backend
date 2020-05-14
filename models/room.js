const Joi = require('@hapi/joi');
const mongoose = require('mongoose');

/*** Schema and Model ***/
const roomSchema = new mongoose.Schema({
  name: {
    type: Number,
    min: 1,
    max: 255,
    required: true,
  },
});
const Room = mongoose.model('Room', roomSchema);
Room.modelName = 'Room';

/*** JOI Validation ***/
function validateRoom(room) {
  const roomJoiSchema = Joi.object({
    name: Joi.number().min(1).max(255).required(),
  });

  return roomJoiSchema.validate(room);
}

module.exports.joiValidate = validateRoom;
module.exports.Room = Room;

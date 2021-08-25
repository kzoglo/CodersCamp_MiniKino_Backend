import Joi from 'joi';
import mongoose from 'mongoose';

/*** Schema and Model ***/
const roomSchema = new mongoose.Schema({
  name: {
    type: Number,
    min: 1,
    max: 255,
    required: true,
  },
});
export const Room = mongoose.model('Room', roomSchema);
Room.modelName = 'Room';

/*** JOI Validation ***/
export const validateRoom = (room) => {
  const roomJoiSchema = Joi.object({
    name: Joi.number().min(1).max(255).required(),
  });

  return roomJoiSchema.validate(room);
}

// module.exports.joiValidate = validateRoom;
// module.exports.Room = Room;

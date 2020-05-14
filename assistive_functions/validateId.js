const validateId = async (value, model) => {
  const foundDoc = await model.findById(value);
  if (!foundDoc) return false;
  return true;
};

const validationMsg = (model) =>
  `Given ${model.modelName.toLowerCase()}_id does not exist in DB.`;

module.exports.validateId = validateId;
module.exports.validationMsg = validationMsg;

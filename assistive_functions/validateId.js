const validateId = async (id, model) => {
  const foundDoc = await model.findById(id);
  if (!foundDoc) return false;
  return true;
};

const validationMsg = (model) =>
  `Given ${model.modelName.toLowerCase()}_id does not exist in DB.`;

module.exports = {
  validateId,
  validationMsg,
};

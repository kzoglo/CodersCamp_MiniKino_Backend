const handleErrors = require('../assistive_functions/handleErrors');

export const checkForExistingDoc = async (data, model) => {
  const existingDoc = await model.findOne(data);
  if (existingDoc)
    handleErrors(`${model.modelName} has been already created.`, 409);
};

// module.exports = checkForExistingDoc;

import { handleErrors } from './handleErrors';
import { Movie } from '../modules/Movie/model';

//TODO - add rest models types
type IAllModels = typeof Movie;

//TODO - do sth with 'any' type | think about 'never' type
export const checkForExistingDoc = async (data: any, model: IAllModels): Promise<void | never> => {
  //TODO - think about moving it to separate structure
  const existingDoc = await model.findOne(data).lean().exec();
  if (existingDoc)
    handleErrors(`${model.modelName} has been already created.`, 409);
};

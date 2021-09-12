import { isEqual } from '../tools/predicates'
import { handleErrors } from './handleErrors';

const assureSuccessfulLoad = (data: any): any => {
  if(Array.isArray(data) && isEqual(data.length, 0))
    handleErrors('No movies found.', 404);
  if(!data) {
    handleErrors('Movie not found.', 404);
  }
}

export default assureSuccessfulLoad;

import validator from 'validator';
import { ValidationError } from '../errors/Errors';

//TODO - mayby create and implement interfaces methods/getters
export default class RequestValidator<A> {
  private readonly lengthMin = 3;
  private readonly lengthMax = 100;
  private readonly intMin = 1;
  private readonly intMax = 1000e5;
  private _result: A;

  /**
   * @param value - value for validation and sanitation
  */
  constructor(value: A) {
    this._result = value;
  }

  get withSanitation() {
    //TODO - mayby give an opportunity to eventually use this.result in chain
    return {
      trimAll: this.trimAll,
    } 
  }

  get withoutSanitation() {
    //TODO - mayby restrain an opportunity to eventually use this.result in chain
    return this.methodsListNoSanitation; 
  }

  private trimAll = () => {
    const valStr = this._result.toString();
    this._result = validator.trim(valStr) as null as A;
    return this.methodsList;
  }

  private isMongoId = () => {
    const valStr = this._result.toString();
    if(!validator.isMongoId(valStr))
      throw new ValidationError(valStr, 'mongoId');
    return {
      ...this.methodsListNoSanitation,
      result: this.result,
    };
  }

  private isLength = () => {
    const valStr = this._result.toString();
    if(!validator.isLength(valStr, { min: this.lengthMin, max: this.lengthMax }))
      throw new ValidationError(valStr, 'length');
    
    return {
      ...this.methodsListNoSanitation,
      result: this.result,
    };
  }

  private isInteger = () => {
    const valStr = this._result.toString();
    if(!validator.isInt(valStr, { min: this.intMin, max: this.intMax }))
      throw new ValidationError(valStr, 'number');
    return {
      ...this.methodsListNoSanitation,
      result: this.result,
    };
  }

  private methodsList = {
    trimAll: this.trimAll,
    isMongoId: this.isMongoId,
    isLength: this.isLength,
    isInteger: this.isInteger,
  }

  private methodsListNoSanitation = {
    isMongoId: this.isMongoId,
    isLength: this.isLength,
    isInteger: this.isInteger,
  }

  private get result() {
    return this._result;
  }
}

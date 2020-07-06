const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const mongoose = require('mongoose');
chai.use(chaiAsPromised);
const expect = chai.expect;

const handleErrors = require('../../assistive_functions/handleErrors');
const checkForExistingDoc = require('../../assistive_functions/checkForExistingDoc');
const { User } = require('../../models/user');
const joiValidation = require('../../assistive_functions/joiValidation');
const presaveValidationHandler = require('../../assistive_functions/presaveValidationHandler');
let validateId = require('../../assistive_functions/validateId').validateId;
let validationMsg = require('../../assistive_functions/validateId')
  .validationMsg;

describe('Assistive Functions', () => {
  /*** handleErrors ***/
  describe('handleErrors', () => {
    it('should throw an error with status 500 and "Server Error" msg if no args are passed', () => {
      expect(handleErrors).to.throw('Server Error');
      try {
        handleErrors();
      } catch (err) {
        expect(err).to.be.an('error').and.include.property('statusCode', 500);
      }
    });

    it('should throw an error with status different than 500 and with msg different than "Server Error" if args are passed', () => {
      const argsArr = [
        [422, '422'],
        [400, '400'],
        [401, '401'],
        [404, '404'],
      ];

      argsArr.forEach((arr) => {
        expect(() => handleErrors(arr[1], arr[0])).to.throw(arr[1]);
        try {
          handleErrors(arr[1], arr[0]);
        } catch (err) {
          expect(err).to.be.an('error').and.have.property('statusCode', arr[0]);
        }
      });
    });
  });

  /*** chekcForExistingDoc ***/
  describe('checkForExistingDoc', () => {
    afterEach(() => {
      User.findOne.restore();
    });

    const model = User;
    let data;

    it('should return error with status 409 and message "User has been already created." if a record with the same _id exists in db', async () => {
      data = {
        _id: new mongoose.Types.ObjectId(),
        name: 'Someone',
      };
      sinon.stub(User, 'findOne');
      User.findOne.returns(data);

      await checkForExistingDoc(data, model).then(
        () => {},
        (err) => {
          expect(err).to.be.an('error').that.have.property('statusCode', 409);
        }
      );

      return expect(checkForExistingDoc(data, model)).to.be.rejectedWith(
        'User has been already created.'
      );
    });

    it('should return undefined if a record with the same _id does not exist in db', () => {
      data = null;
      sinon.stub(User, 'findOne');
      User.findOne.returns(data);
      return expect(checkForExistingDoc(data, model)).to.eventually.be
        .undefined;
    });
  });

  /*** joiValidation ***/
  describe('joiValidation', () => {
    let error = new Error();
    error.details = [{ message: 'Error message from package' }];
    const value = 'Validation passed';
    const joiValidate = (obj) => {
      return obj;
    };

    it('should return an error 422 with a custom message from @hapi/joi package if input validation failed', () => {
      try {
        joiValidation(joiValidate, { error, value });
      } catch (err) {
        expect(err).to.be.an('error').that.has.property('statusCode', 422);
      }

      expect(() => joiValidation(joiValidate, { error, value })).to.throw(
        'Error message from package'
      );
    });

    it('should return validated value if it was validated successfully', () => {
      error = null;

      const result = joiValidation(joiValidate, { error, value });
      expect(result).to.be.eq('Validation passed');
    });
  });

  /*** presaveValidationHandler ***/
  describe('presaveValidationHandler', () => {
    beforeEach(() => {
      err = new Error();
      next = { next: (err) => err.statusCode };
    });

    let err;
    let next;

    it('should call "next" middleware with an error with statusCode of 422 if a name prop of that error is equal to "ValidationError"', () => {
      err.name = 'ValidationError';
      const spy = sinon.spy(next, 'next');
      presaveValidationHandler(err, next.next);
      expect(spy.called).to.be.true;
      expect(spy.returned(422)).to.be.true;
    });

    it("should call next() with error, which doesn't have statusCode of 422 if a name prop of that error is not equal to 'ValidationError'", () => {
      err.name = null;
      const spy = sinon.spy(next, 'next');
      presaveValidationHandler(err, next.next);
      expect(spy.called).to.be.true;
      expect(spy.returned(422)).to.be.not.true;
    });
  });

  /*** ValidateId ***/
  describe('validateId', () => {
    const id = null;

    describe('validateId function', () => {
      afterEach(() => {
        User.findById.restore();
      });

      before(() => {
        validateId = require('../../assistive_functions/validateId').validateId;
        validationMsg = require('../../assistive_functions/validateId')
          .validationMsg;
      });

      it('should return true, if a given record was found', () => {
        sinon.stub(User, 'findById');
        User.findById.returns(true);
        return expect(validateId(id, User)).to.eventually.be.true;
      });

      it('should return false if a given record was not found', () => {
        sinon.stub(User, 'findById');
        User.findById.returns(false);
        return expect(validateId(id, User)).to.eventually.be.false;
      });
    });

    describe('validationMsg function', () => {
      it('should return a string with proper type of _id in lowercase, e.g. "Given user_id does not exist in DB." if model param is passed', () => {
        const result = validationMsg({ modelName: 'User' });
        expect(result).to.have.string('user_id');
      });
    });
  });
});

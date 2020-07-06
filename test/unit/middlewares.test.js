const mongoose = require('mongoose');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
chai.use(chaiAsPromised);
const expect = chai.expect;
const proxyquire = require('proxyquire');
const jwt = require('jsonwebtoken');

const areParamsObjectIds = require('../../middleware/areParamsObjectIds');
const isAdmin = require('../../middleware/isAdmin');
const isAuth = require('../../middleware/isAuth');

describe('Middleware', () => {
  /*** areParamsObjectIds ***/
  describe('areParamsObjectIds', () => {
    const params = {
      nums12: 123456789012,
      nums1: 1,
      nums23: 1234567890121234567890121,
      string2: '22',
      string12: '123456789012',
      string23: '1234567890121234567890121',
      string0: '',
      obj: {},
      arr: {},
      func: () => {},
      nullVal: null,
      undefinedVal: undefined,
      nan: NaN,
    };

    const res = {};
    const next = () => {};

    it("should return an error 422 with a message 'Invalid params data.' if all req params are not of type objectId", () => {
      for (const key in params) {
        const req = {
          params: {
            key1: params[key],
          },
        };

        expect(() => areParamsObjectIds(req, res, next)).to.throw(
          'Invalid params data.'
        );
        try {
          areParamsObjectIds(req, res, next);
        } catch (err) {
          expect(err).to.be.an('error').and.include.property('statusCode', 422);
        }
      }
    });

    it('should call the "next" middleware if all req params are of type objectId', () => {
      const req = {
        params: {
          a1: new mongoose.Types.ObjectId(),
          a2: new mongoose.Types.ObjectId(),
        },
      };
      const nextObj = {
        next: () => {},
      };
      sinon.stub(nextObj, 'next').returns();

      areParamsObjectIds(req, res, nextObj.next);
      expect(nextObj.next.called).to.be.true;
    });
  });

  /*** isAdmin ***/
  describe('isAdmin', () => {
    let req, res, nextObj, spyNext;

    beforeEach(() => {
      req = {
        body: {},
      };
      res = {};
      nextObj = {
        next: (err) => err,
      };
      spyNext = sinon.spy(nextObj, 'next');
    });

    afterEach(() => {
      spyNext.restore();
    });

    it('should return "next" middleware, if req was made to "POST /api/user" endpoint, but to create standard user account(not need be an admin to create it)', () => {
      nextObj.next.restore();
      sinon.stub(nextObj, 'next').returns('next middleware was returned');

      const result = isAdmin(req, res, nextObj.next);
      expect(result).to.be.eq('next middleware was returned');
      nextObj.next.restore();
    });

    it('should call "next" middleware, if req.admin prop is equal to "true"', () => {
      req.admin = true;

      isAdmin(req, res, nextObj.next);
      expect(spyNext.called).to.be.true;
    });

    it("should return 'next' middleware with an error as an argument, which has 'statuCode' prop of 403 and 'message' prop - 'Not an admin. Access forbidden.', if req.admin prop is not equal to 'true'", () => {
      req.admin = false;
      const result = isAdmin(req, res, nextObj.next);

      expect(result)
        .to.be.an('error')
        .that.includes.property('statusCode', 403);
      expect(result).to.includes.property(
        'message',
        'Not an admin. Access forbidden.'
      );
    });
  });

  /*** isAuth ***/
  describe('isAuth', () => {
    let req, res, nextObj, spy, verifyStub;

    beforeEach(() => {
      req = {
        body: {},
        get: () => false,
      };
      res = {};
      nextObj = {
        next: (err) => err,
      };

      verifyStub = sinon.stub(jwt, 'verify');
      spy = sinon.spy(nextObj, 'next');
    });

    afterEach(() => {
      jwt.verify.restore();
    });

    it('should return "next" middleware, if req was made to "POST /api/user" endpoint, but to create standard user account(not need be authenticated to create it)', () => {
      nextObj.next.restore();
      sinon.stub(nextObj, 'next').returns('next middleware was returned');

      const result = isAuth(req, res, nextObj.next);
      expect(result).to.be.eq('next middleware was returned');
    });

    it('should return "next" middleware with an error object as an argument, which has properties: "statusCode" of 401 and a "message" - "Could not authenticate!", if req object does not have "Authorization" header present', () => {
      const result = isAuth(req, res, nextObj.next);
      expect(result)
        .to.be.an('error')
        .that.includes.property('statusCode', 401);
    });

    it('should return "next" middleware with an error object as an argument, which has properties: "statusCode" of 401 and "message" - "jwt malformed", if JWT was malformed', () => {
      req.get = () => 'string1 string2';
      const err = new Error('jwt malformed');
      err.statusCode = 401;
      verifyStub.throws(err);
      const result = isAuth(req, res, nextObj.next);

      expect(result)
        .to.be.an('error')
        .that.includes.property('statusCode', 401);
      expect(result).to.includes.property('message', 'jwt malformed');
    });

    it('should return "next" middleware with an error object as an argument, which has property "message" - "jwt malformed", if JWT was malformed and additionally error obj should has property "statusCode", which will be set to 401, if that prop is not set in the beginning', () => {
      req.get = () => 'string1 string2';
      const err = new Error('jwt malformed');
      verifyStub.throws(err);
      const result = isAuth(req, res, nextObj.next);

      expect(result)
        .to.be.an('error')
        .that.includes.property('statusCode', 401);
      expect(result).to.includes.property('message', 'jwt malformed');
    });

    it('should add "user_id" and "admin" props to req object and call next middleware if JWT is properly verified', () => {
      nextObj.next.restore();
      req.get = () => 'string1 string2';
      verifyStub.returns({
        _id: true,
        admin: true,
      });
      const spyNext = sinon.spy(nextObj, 'next');
      isAuth(req, res, nextObj.next);

      expect(req).to.include({ user_id: true, admin: true });
      expect(spyNext.called).to.be.true;

      spyNext.restore();
    });
  });
});

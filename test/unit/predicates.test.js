const expect = require('chai').expect;
const sinon = require('sinon');

const predicates = require('../../predicates');

describe('Predicates', () => {
  const spy = sinon.spy(predicates, 'isEqual');
  const execExpectations = (result) => {
    expect(result).to.be.eq(result);
    expect(result).to.not.be.eq(!result);
  };

  before(() => {
    spy.resetHistory();
  });

  afterEach(() => {
    spy.resetHistory();
  });

  it('should return true if strictly compared elements are the same', () => {
    // NaN can't be compared with itself
    const items = [1, '1', '', true, null, undefined, {}, [], { a: 'a' }];
    items.forEach((elem) => {
      const result = predicates.isEqual(elem, elem);
      execExpectations(result);
    });
    expect(spy.callCount).to.be.eq(items.length);
  });

  it('should return true if strictly compared elements are different', () => {
    const items = [1, '1', '', true, null, undefined, {}, [], { a: 'a' }];
    items.forEach((elem) => {
      const result = predicates.isEqual(elem, !elem);
      execExpectations(result);
    });
    expect(spy.callCount).to.be.eq(items.length);
  });
});

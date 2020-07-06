const expect = require('chai').expect;
const { isEqual, isInequal } = require('../../predicates');

describe('Predicates', () => {
  const execExpectations = (result) => {
    expect(result).to.be.eq(result);
    expect(result).to.not.be.eq(!result);
  };

  it('should return true if strictly compared elements are the same', () => {
    // NaN can't be compared with itself
    const items = [1, '1', '', true, null, undefined, {}, [], { a: 'a' }];
    items.forEach((elem) => {
      const result = isEqual(elem, elem);
      execExpectations(result);
    });
  });

  it('should return true if strictly compared elements are different', () => {
    const items = [1, '1', '', true, null, undefined, {}, [], { a: 'a' }];
    items.forEach((elem) => {
      const result = isInequal(elem, !elem);
      execExpectations(result);
    });
  });
});

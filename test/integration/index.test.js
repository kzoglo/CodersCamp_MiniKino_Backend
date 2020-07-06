const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
chai.use(chaiAsPromised);
const expect = chai.expect;
const mongoose = require('mongoose');

describe('index - main file', () => {
  let server, errorsLog, consoleStub, connectStub;

  beforeEach((done) => {
    errorsLog = [];
    connectStub = sinon
      .stub(mongoose.Mongoose.prototype, 'connect')
      .returns(Promise.reject(''));
    consoleStub = sinon.stub(console, 'error').callsFake((msg, err) => {
      errorsLog.push(msg);
      console.log(msg);
    });

    server = require('../../index');
    setTimeout(done, 500);
  });

  afterEach(() => {
    server.close();

    connectStub.restore();
    consoleStub.restore();
    delete require.cache[require.resolve('../../index')];
  });

  it('should call "console.error" with a message "Could not connect to CC5_Cinema_tests...", if mongoose can\'t connect to the database', () => {
    expect(consoleStub.called).to.be.true;
    expect(errorsLog).to.contain('Could not connect to CC5_Cinema_tests...');
  });
});

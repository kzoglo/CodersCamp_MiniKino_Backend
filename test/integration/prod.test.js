const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
chai.use(chaiAsPromised);
const expect = chai.expect;
const mongoose = require('mongoose');
const config = require('config');

describe('prod', () => {
  let server, consoleLog, consoleStub, connectStub, configStub;

  beforeEach((done) => {
    consoleLog = [];
    process.env.NODE_ENV = 'production';

    connectStub = sinon
      .stub(mongoose.Mongoose.prototype, 'connect')
      .returns(Promise.resolve('Connected to productionDB...'));
    consoleStub = sinon.stub(console, 'log').callsFake((msg, err) => {
      consoleLog.push(msg);
    });
    configStub = sinon.stub(config, 'get').returns({
      dbName: 'productionDB',
      portNb: '',
      host: '',
      password: '',
    });

    server = require('../../index');
    setTimeout(done, 500);
  });

  afterEach(() => {
    process.env.NODE_ENV = 'testing';

    server.close();
    connectStub.restore();
    consoleStub.restore();
    configStub.restore();
    delete require.cache[require.resolve('../../index')];
  });

  it('should execute "prod" file, if production environment is active, which is determined by connection to productionDB', () => {
    expect(consoleLog).to.contain('Connected to productionDB...');
  });
});

const Chai = require('chai');
const ChaiAsPromised = require('chai-as-promised');
const Sinon = require('sinon');
const SinonChai = require("sinon-chai");

Chai.use(ChaiAsPromised);
Chai.use(SinonChai);

global.expect = Chai.expect;
global.sinon = Sinon;
global.fb = {
  ...require('./fb-cb'),
  ...require('./fb-runtime')
};

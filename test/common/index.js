const Chai = require('chai');
const ChaiAsPromised = require('chai-as-promised');

Chai.use(ChaiAsPromised);

global.expect = Chai.expect;
global.fb = {
  ...require('./fb-cb'),
  ...require('./fb-runtime')
};

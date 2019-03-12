const Transmitter = require('../src');
const Channel = require('@fappurbate/channel-ext');

describe('requests', function () {
  beforeEach(function () {
    this.bot = new Channel({ name: 'test' });
    this.transmitter = new Transmitter({ botChannel: this.bot });
  });

  afterEach(function () {
    this.transmitter.close();
    fb.runtime.$events.removeAllListeners();
  });

  it('receives response from @bot', function () {
    return expect(
      this.transmitter.sendRequest('@bot', 'test-success', { number: 40 })
    ).to.eventually.eql({ boom: { number: 40 } });
  });

  it('handles requests from @bot', function () {
    this.transmitter.onRequest.addHandler('test-request', (sender, data) => {
      expect(sender).to.equal('@bot');
      expect(data).to.eql({ number: 40 });

      return data.number + 2;
    });

    expect(
      this.bot._requestHandlers.request('test-request', { number: 40 })
    ).to.equal(42);
  });

  it('handles requests from pages', function () {
    this.transmitter.onRequest.addHandler('test-request', (sender, data) => {
      expect(sender).to.equal('my-page');
      expect(data).to.eql({ number: 40 });

      return data.number + 2;
    });

    expect(
      fb.runtime.$sendRequest('my-page', 'test-request', { number: 40 })
    ).to.equal(42);
  });
});

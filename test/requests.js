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

  it('handles requests from @bot', function (done) {
    let failed = false;
    this.transmitter.onRequest.addHandler('test-request', (sender, data) => {
      try {
        expect(sender).to.equal('@bot');
        expect(data).to.eql({ number: 40 });
      } catch (error) {
        failed = true;
        done(error);
      }

      return data.number + 2;
    });
    fb.cb.$events.on('success', (requestId, data) => {
      if (failed) { return; }

      try {
        expect(requestId).to.equal(0);
        expect(data).to.equal(42);
        done();
      } catch(error) {
        done(error);
      }
    });
    fb.cb.$sendMessage(
      'notice',
      new Date,
      {
        username: 'Basie',
        content: `/fb/channel/["test", "request", 0, "test-request", { "number": 40 }]`
      }
    );
  });

  it('handles requests from pages', function (done) {
    let failed = false;
    this.transmitter.onRequest.addHandler('test-request', (sender, data) => {
      try {
        expect(sender).to.equal('my-page');
        expect(data).to.eql({ number: 40 });
      } catch (error) {
        failed = true;
        done(error);
      }

      return data.number + 2;
    });

    expect(fb.runtime.$sendRequest('my-page', 'test-request', { number: 40 }))
      .to.equal(42);
    if (!failed) {
      done();
    }
  });
});

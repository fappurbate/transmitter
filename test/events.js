const Transmitter = require('../src');
const Channel = require('@fappurbate/channel-ext');

describe('events', function () {
  beforeEach(function () {
    this.bot = new Channel({ name: 'test' });
    this.transmitter = new Transmitter({ botChannel: this.bot });
  });

  afterEach(function () {
    this.transmitter.close();
    fb.runtime.$events.removeAllListeners();
  });

  it('emit events to @bot', function (done) {
    fb.cb.$events.once('event', (subject, data)=> {
      expect(subject).to.equal('test-event');
      expect(data).to.eql({ number: 42 });
      done();
    });
    this.transmitter.emitEvent(['@bot', 'my-page'], 'test-event', { number: 42 });
  });

  it('emit events to pages', function (done) {
    fb.runtime.$events.once('event', ({ receivers, subject, data }) => {
      expect(receivers).to.eql(['my-page']);
      expect(subject).to.equal('test-event');
      expect(data).to.eql({ number: 42 });
      done();
    });
    this.transmitter.emitEvent(['@bot', 'my-page'], 'test-event', { number: 42 });
  });

  it('receives events from @bot', function (done) {
    this.transmitter.onEvent.addListener('test-event', (sender, data) => {
      expect(sender).to.equal('@bot');
      expect(data).to.eql({ number: 42 });
      done();
    });
    fb.cb.$sendMessage(
      'notice',
      new Date,
      { content: `/fb/channel/["test", "event", "test-event", { "number": 42 }]` }
    );
  });

  it('receives events from pages', function (done) {
    this.transmitter.onEvent.addListener('test-event', (sender, data) => {
      expect(sender).to.equal('my-page');
      expect(data).to.eql({ number: 42 });
      done();
    });
    fb.runtime.$emitEvent('my-page', 'test-event', { number: 42 });
  });
});

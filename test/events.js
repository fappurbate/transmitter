const Transmitter = require('../src');
const Channel = require('@fappurbate/channel-ext');

describe('events', function () {
  beforeEach(function () {
    this.botChannel = new Channel({ name: 'test' });
    this.transmitter = new Transmitter({ botChannel: this.botChannel });
  });

  afterEach(function () {
    this.transmitter.close();
    fb.runtime.$events.removeAllListeners();
  });

  it('emit events to @bot', function (done) {
    const fakeEmit = sinon.fake();
    sinon.replace(this.botChannel, 'emit', fakeEmit);

    this.transmitter.emitEvent(['@bot', 'my-page'], 'test-event', { number: 42 });

    setTimeout(() => {
      expect(fakeEmit).to.have.been.calledWith('test-event', { number: 42 });
      done();
    });
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
    this.botChannel._eventHandlers.emit('test-event', { number: 42 });
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

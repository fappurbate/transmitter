const Transmitter = require('../src');
const Channel = require('@fappurbate/channel-ext');

describe('forwarding events', function () {
  beforeEach(function () {
    this.bot = new Channel({ name: 'test' });
    this.transmitter = new Transmitter({ botChannel: this.bot });
  });

  afterEach(function () {
    this.transmitter.close();
    fb.runtime.$events.removeAllListeners();
  });

  it('forwards events', function () {
    this.transmitter.forwardEvents(['test-event'], 'page', '@bot');

    const fakeEmit = sinon.fake();
    sinon.replace(this.bot, 'emit', fakeEmit);

    fb.runtime.$emitEvent('page', 'test-event', { number: 42 });

    expect(fakeEmit).to.have.been.calledWith('test-event', { number: 42 });
  });

  it('forwards events with transformation', function () {
    this.transmitter.forwardEvents(['test-event'], 'page', '@bot', {
      'test-event': {
        transform: ({ number }) => ({ number: number + 1 })
      }
    });

    const fakeEmit = sinon.fake();
    sinon.replace(this.bot, 'emit', fakeEmit);

    fb.runtime.$emitEvent('page', 'test-event', { number: 42 });

    expect(fakeEmit).to.have.been.calledWith('test-event', { number: 43 });
  });

  it('forwards events with transformation using $default', function () {
    this.transmitter.forwardEvents(['test-event'], 'page', '@bot', {
      $default: {
        transform: ({ number }) => ({ number: number + 1 })
      }
    });

    const fakeEmit = sinon.fake();
    sinon.replace(this.bot, 'emit', fakeEmit);

    fb.runtime.$emitEvent('page', 'test-event', { number: 42 });

    expect(fakeEmit).to.have.been.calledWith('test-event', { number: 43 });
  });

  it('$default has lower priority', function () {
    this.transmitter.forwardEvents(['test-event'], 'page', '@bot', {
      'test-event': {
        transform: ({ number }) => ({ number: number - 1 })
      },
      $default: {
        transform: ({ number }) => ({ number: number + 1 })
      }
    });

    const fakeEmit = sinon.fake();
    sinon.replace(this.bot, 'emit', fakeEmit);

    fb.runtime.$emitEvent('page', 'test-event', { number: 42 });

    expect(fakeEmit).to.have.been.calledWith('test-event', { number: 41 });
  });

  it('forwards events with redirection', function () {
    this.transmitter.forwardEvents(['test-event'], 'page', '@bot', {
      'test-event': { redirect: 'new-test-event' }
    });

    const fakeEmit = sinon.fake();
    sinon.replace(this.bot, 'emit', fakeEmit);

    fb.runtime.$emitEvent('page', 'test-event', { number: 42 });

    expect(fakeEmit).to.not.have.been.calledWith('test-event', { number: 42 });
    expect(fakeEmit).to.have.been.calledWith('new-test-event', { number: 42 });
  });

  it('redirect can be a function', function () {
    this.transmitter.forwardEvents(['test-event'], 'page', '@bot', {
      'test-event': { redirect: subject => 'new-' + subject }
    });

    const fakeEmit = sinon.fake();
    sinon.replace(this.bot, 'emit', fakeEmit);

    fb.runtime.$emitEvent('page', 'test-event', { number: 42 });

    expect(fakeEmit).to.not.have.been.calledWith('test-event', { number: 42 });
    expect(fakeEmit).to.have.been.calledWith('new-test-event', { number: 42 });
  });

  it('unforwards', function () {
    const unforward = this.transmitter.forwardEvents(['test-event'], 'page', '@bot');
    unforward();

    const fakeEmit = sinon.fake();
    sinon.replace(this.bot, 'emit', fakeEmit);

    fb.runtime.$emitEvent('page', 'test-event', { number: 42 });

    expect(fakeEmit).to.not.have.been.called;
  });
});

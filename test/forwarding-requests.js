const Transmitter = require('../src');
const Channel = require('@fappurbate/channel-ext');

describe('forwarding requests', function () {
  beforeEach(function () {
    this.botChannel = new Channel({ name: 'test' });
    this.transmitter = new Transmitter({ botChannel: this.botChannel });
  });

  afterEach(function () {
    this.transmitter.close();
    fb.runtime.$events.removeAllListeners();
  });

  it('forwards requests', async function () {
    this.transmitter.forwardRequests(['test-request'], 'page', '@bot');

    const fakeRequest = sinon.fake.returns(await { response: 'boom' });
    sinon.replace(this.botChannel, 'request', fakeRequest); // bot will always answer with { response: 'boom' }

    const result = await fb.runtime.$sendRequest('page', 'test-request', { number: 40 }); // send request from 'page' to '@main' which should be forwarded to '@bot'
    expect(result).to.eql({ response: 'boom' });
    expect(fakeRequest).to.have.been.calledWith('test-request', { number: 40 });
  });

  it('forwards requests with request transformation', async function () {
    this.transmitter.forwardRequests(['test-request'], 'page', '@bot', {
      'test-request': {
        transformRequest: ({ number }) => ({ number: number + 2 })
      }
    });

    const fakeRequest = sinon.fake.returns(await { response: 'boom' });
    sinon.replace(this.botChannel, 'request', fakeRequest); // bot will always answer with { response: 'boom' }

    const result = await fb.runtime.$sendRequest('page', 'test-request', { number: 40 }); // send request from 'page' to '@main' which should be forwarded to '@bot'
    expect(result).to.eql({ response: 'boom' });
    expect(fakeRequest).to.have.been.calledWith('test-request', { number: 42 });
  });

  it('forwards requests with request transformation using $default', async function () {
    this.transmitter.forwardRequests(['test-request'], 'page', '@bot', {
      $default: {
        transformRequest: ({ number }) => ({ number: number + 2 })
      }
    });

    const fakeRequest = sinon.fake.returns(await { response: 'boom' });
    sinon.replace(this.botChannel, 'request', fakeRequest); // bot will always answer with { response: 'boom' }

    const result = await fb.runtime.$sendRequest('page', 'test-request', { number: 40 }); // send request from 'page' to '@main' which should be forwarded to '@bot'
    expect(result).to.eql({ response: 'boom' });
    expect(fakeRequest).to.have.been.calledWith('test-request', { number: 42 });
  });

  it('$default has lower priority', async function () {
    this.transmitter.forwardRequests(['test-request'], 'page', '@bot', {
      'test-request': {
        transformRequest: ({ number }) => ({ number: number - 2 })
      },
      $default: {
        transformRequest: ({ number }) => ({ number: number + 2 })
      }
    });

    const fakeRequest = sinon.fake.returns(await { response: 'boom' });
    sinon.replace(this.botChannel, 'request', fakeRequest); // bot will always answer with { response: 'boom' }

    const result = await fb.runtime.$sendRequest('page', 'test-request', { number: 40 }); // send request from 'page' to '@main' which should be forwarded to '@bot'
    expect(result).to.eql({ response: 'boom' });
    expect(fakeRequest).to.have.been.calledWith('test-request', { number: 38 });
  });

  it('forwards requests with success response transformation', async function () {
    this.transmitter.forwardRequests(['test-request'], 'page', '@bot', {
      'test-request': {
        transformResponse: payload => {
          if (payload instanceof Transmitter.Failure) {
            console.log('How??');
          } else {
            return { response: payload.response.toUpperCase() };
          }
        }
      }
    });

    const fakeRequest = sinon.fake.returns(await { response: 'boom' });
    sinon.replace(this.botChannel, 'request', fakeRequest); // bot will always answer with { response: 'boom' }

    const result = await fb.runtime.$sendRequest('page', 'test-request', { number: 40 }); // send request from 'page' to '@main' which should be forwarded to '@bot'
    expect(result).to.eql({ response: 'BOOM' });
    expect(fakeRequest).to.have.been.calledWith('test-request', { number: 40 });
  });

  it('forwards requests with error response transformation', async function () {
    this.transmitter.forwardRequests(['test-request'], 'page', '@bot', {
      'test-request': {
        transformResponse: payload => {
          if (payload instanceof Transmitter.Failure) {
            throw new Transmitter.Failure({ reason: payload.data.reason.toUpperCase() });
          }
          return 'something must have gone wrong';
        }
      }
    });

    const fakeRequest = sinon.fake.returns(Promise.reject(new Transmitter.Failure({ reason: 'boom' })));
    sinon.replace(this.botChannel, 'request', fakeRequest); // bot will always answer with { response: 'boom' }

    try {
      const result = await fb.runtime.$sendRequest('page', 'test-request', { number: 40 }); // send request from 'page' to '@main' which should be forwarded to '@bot'
      throw new Error('should have failed');
    } catch (error) {
      expect(error.data).to.eql({ reason: 'BOOM' });
      expect(fakeRequest).to.have.been.calledWith('test-request', { number: 40 });
    }
  });

  it('forwards requests with redirection', async function () {
    this.transmitter.forwardRequests(['test-request'], 'page', '@bot', {
      'test-request': {
        redirect: 'new-test-request'
      }
    });

    const fakeRequest = sinon.fake.returns(await { response: 'boom' });
    sinon.replace(this.botChannel, 'request', fakeRequest); // bot will always answer with { response: 'boom' }

    const result = await fb.runtime.$sendRequest('page', 'test-request', { number: 40 }); // send request from 'page' to '@main' which should be forwarded to '@bot'
    expect(result).to.eql({ response: 'boom' });
    expect(fakeRequest).to.have.been.calledWith('new-test-request', { number: 40 });
  });

  it('redirect can be a function', async function () {
    this.transmitter.forwardRequests(['test-request'], 'page', '@bot', {
      'test-request': {
        redirect: subject => 'new-' + subject
      }
    });

    const fakeRequest = sinon.fake.returns(await { response: 'boom' });
    sinon.replace(this.botChannel, 'request', fakeRequest); // bot will always answer with { response: 'boom' }

    const result = await fb.runtime.$sendRequest('page', 'test-request', { number: 40 }); // send request from 'page' to '@main' which should be forwarded to '@bot'
    expect(result).to.eql({ response: 'boom' });
    expect(fakeRequest).to.have.been.calledWith('new-test-request', { number: 40 });
  });

  it('unforwards', async function () {
    const unforward = this.transmitter.forwardRequests(['test-request'], 'page', '@bot', {
      'test-request': {
        redirect: subject => 'new-' + subject
      }
    });
    unforward();

    const fakeRequest = sinon.fake.returns(await { response: 'boom' });
    sinon.replace(this.botChannel, 'request', fakeRequest); // bot will always answer with { response: 'boom' }

    fb.runtime.$sendRequest('page', 'test-request', { number: 40 }); // send request from 'page' to '@main' which should not be forwarded to '@bot' nor redirected
    expect(fakeRequest).to.not.have.been.called;
  });
});

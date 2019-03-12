const Channel = require('@fappurbate/channel-ext');
const EventEmitter = require('events');

const RANDOM_STRING = '2/sd&&Fgw3e4.sdc@3w';

class Transmitter {
  constructor(options = {}) {
    this._botChannel = options.botChannel || new Channel({
      name: `${RANDOM_STRING}_${fb.runtime.name}`
    });

    this.onEvent = {
      addListener: (subject, callback) => {
        this._onEventAddListener(subject, callback);
        return this.onEvent;
      },
      removeListener: (subject, callback) => {
        this._onEventRemoveListener(subject, callback);
        return this.onEvent;
      }
    };

    this.onRequest = {
      addHandler: (subject, handler) => {
        this._onRequestAddHandler(subject, handler);
        return this.onRequest;
      },
      removeHandler: (subject, handler) => {
        this._onRequestRemoveHandler(subject, handler);
        return this.onRequest;
      }
    };

    this._botListeners = {};
    this._botHandlers = {};
    this._fbListeners = {};
    this._fbHandlers = {};
  }

  close() {
    Object.keys(this._fbListeners).forEach(subject =>
      this._fbListeners[subject].forEach(listener =>
        fb.runtime.onEvent.removeListener(subject, listener)
      )
    );
    Object.keys(this._fbHandlers).forEach(subject =>
      this._fbHandlers[subject].forEach(handler =>
        fb.runtime.onRequest.removeHandler(subject, handler)
      )
    );
    return this._botChannel.close();
  }

  /**
   * @param {string[]} receivers
   * @param {string} subject
   * @param {any?} data
   */
  emitEvent(receivers, subject, data) {
    if (receivers.includes('@bot')) {
      receivers = receivers.filter(x => x !== '@bot');
      this._botChannel.emit(subject, data);
    }

    if (receivers.length > 0) {
      fb.runtime.emitEvent(receivers, subject, data);
    }
  }

  /**
   * @param {string} receiver
   * @param {string} subject
   * @param {any?} data
   * @return {Promise}
   * @throws {Transmitter.Failure}
   */
  async sendRequest(receiver, subject, data = {}) {
    if (receiver === '@bot') {
      return this._botChannel.request(subject, data);
    } else {
      throw new fb.Error('Invalid receiver.', 'ERR_INVALID_RECEIVER', { receiver });
    }
  }

  _onEventAddListener(subject, callback) {
    this._botChannel.onEvent.addListener(subject, this._botListeners[callback] = data => {
      callback('@bot', data);
    });

    fb.runtime.onEvent.addListener(subject, callback);
    this._fbListeners[subject] = this._fbListeners[subject] || [];
    this._fbListeners[subject].push(callback);
  }

  _onEventRemoveListener(subject, callback) {
    this._botChannel.onEvent.removeListener(subject, this._botListeners[callback]);
    // not implemented yet in upstream but used in tests
    // TODO: remove condition when it's implemented
    if (fb.runtime.onEvent.removeListener) {
      fb.runtime.onEvent.removeListener(subject, callback);
    }
    this._fbListeners[subject].splice(this._fbListeners[subject].indexOf(callback));
    delete this._botListeners[callback];
  }

  _onRequestAddHandler(subject, handler) {
    this._botChannel.onRequest.addHandler(subject, this._botHandlers[handler] = data => {
      return handler('@bot', data);
    });

    fb.runtime.onRequest.addHandler(subject, handler);
    this._fbHandlers[subject] = this._fbHandlers[subject] || [];
    this._fbHandlers[subject].push(handler);
  }

  _onRequestRemoveHandler(subject, handler) {
    this._botChannel.onRequest.removeHandler(subject, this._botHandlers[handler]);
    // not implemented yet in upstream but used in tests
    // TODO: remove condition when it's implemented
    if (fb.runtime.onEvent.removeHandler) {
      fb.runtime.onEvent.removeHandler(subject, handler);
    }
    this._fbHandlers[subject].splice(this._fbHandlers[subject].indexOf(handler));
    delete this._botHandlers[handler];
  }
}
module.exports = Transmitter;

Transmitter.Failure = Channel.Failure;

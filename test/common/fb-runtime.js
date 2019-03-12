const EventEmitter = require('events');
const RequestTarget = require('@kothique/request-target');

const events = new EventEmitter;
const requests = new RequestTarget({
  callAllHandlers: true
});
const testBedEvents = new EventEmitter;

function emitEvent(sender, subject, data) {
  events.emit(subject, sender, data);
}

function sendRequest(sender, subject, data) {
  return requests.request(subject, sender, data);
}

class FappurbateError extends Error {
  constructor(message, type, data) {
    super(message);
    Error.captureStackTrace(this, FappurbateError);

    this.name = 'FappurbateError';
    this.type = type;
    this.data = data;
  }
}

module.exports = {
  Error: FappurbateError,
  runtime: {
    $events: testBedEvents,
    $emitEvent: emitEvent,
    $sendRequest: sendRequest,
    name: 'Boom',
    broadcaster: 'Basie',
    emitEvent: (receivers, subject, data) => {
      testBedEvents.emit('event', { receivers, subject, data });
    },
    onEvent: {
      addListener: (subject, callback) => {
        events.on(subject, callback);
        return this;
      },
      removeListener: (subject, callback) => {
        events.off(subject, callback);
        return this;
      }
    },
    onRequest: {
      addHandler: (subject, handler) => {
        requests.on(subject, handler);
        return this;
      },
      removeHandler: (subject, handler) => {
        requests.off(subject, handler);
        return this;
      }
    }
  }
};

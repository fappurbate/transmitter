const EventEmitter = require('events');

const extensionEvents = new EventEmitter;

module.exports = {
  cb: {
    sendMessage: message => {
      if (message.startsWith('/fb/channel/')) {
        const rest = JSON.parse(message.substr('/fb/channel/'.length));
        const [channelName, type] = rest;

        if (type === 'request') {
          const [,, requestId, subject, data] = rest;

          if (subject === 'test-success') {
            extensionEvents.emit('message', 'notice', new Date, {
              content: `/fb/channel/${JSON.stringify(
                [channelName, 'success', requestId, { boom: data }]
              )}`
            });
          } else if (subject === 'test-failure') {
            extensionEvents.emit('message', 'notice', new Date, {
              content: `/fb/channel/${JSON.stringify(
                [channelName, 'failure', requestId, { boom: data }]
              )}`
            });
          }
        }
      }
    },
    onMessage: {
      addHandler: handler => {
        extensionEvents.on('message', async (type, timestamp, data) => {
          const result = await handler(type, timestamp, data);
        });
      }
    }
  }
};

@fappurbate/transmitter
===========================

Wrapper around Fappurbate Message Passing API and @fappurbate/channel.

### Documentation

#### Class: Transmitter

Imitates Fappurbate Message Passing API by forwarding messages and requests for `@bot` through `Channel`.

##### `new Transmitter(options)`

- `options.botChannel` `Channel?` If not specified, a channel will be created with the name `${SOME_CHARS}_${fb.runtime.name}`.

##### `onEvent.addListener(subject, callback): this`

- `subject` `string` Name of the event to listen to.
- `callback` `(string, any) => void` Callback will be called on a given event with the sender name and data attached as arguments.

Add a listener for a given event subject.

##### `onEvent.removeListener(subject, callback): this`

- `subject` `string` Name of the event.
- `callback` `(string, any) => void` The same callback that was passed to `onEvent.addListener`.

Remove an event listener.

##### `onRequest.addHandler(subject, handler): this`

- `subject` `string` Name of the request.
- `handler` `(string, any => void|any|Promise)` Handler will be called on a given request.

Add a handler for a given request subject. It will be called with the sender name and data attached as arguments. If the handler returns a non-undefined value, no subsequently added handlers will be called. If throws an error, it is sent back to the bot (app) as an error response. May also return a Promise.

##### `onRequest.removeHandler(subject, handler): this`

- `subject` `string` Name of the request.
- `handler` `(string, any => void|any|Promise)` The same handler that was passed to `onRequest.addHandler`.

Remove a request handler.

##### `close(): void`

Unregister all event listeners. After this the transmitter is usable no more. Do it before you try to create another `Transmitter`.

##### `emitEvent(receivers, subject, data): void`

- `receivers` `string[]` Receivers. Can also include `@bot`.
- `subject` `string` Name of the event.
- `data` `any?` Data to send with the event. Must be serializable.

Send an event to pages and/or the bot.

##### `sendRequest(receiver, subject, data): Promise`

- `receiver` `srting` Receiver of the request. Can only be `@bot`.
- `subject` `string` Name of the request.
- `data` `any?` Data to send with the request. Must be serializable.

Send a request to pages and/or the bot. If an error response is received, returns a promise that rejects with a `Transmitter.Failure` that contains attached data. It is to distinguish an error response from other errors like network errors, timeout, etc.

##### `forwardEvent(subject, sender|senders, receiever|receivers, [transform]): Function`

- `subject` `string` Event to forward.
- `sender|senders` `string|string[]` Can be pages or `@bot`.
- `receiver|receivers` `string|string[]` Can be pages or `@bot`.
- `transform` `object?` Transform object. Used to transform event data or to change its subject.
- Returns: `Function` Call it to cancel forwarding.

###### Example:
```js
const transmitter = new Transmitter;
const unforward = transmitter.forwardEvent('tip', '@bot', 'statistics', {
  redirect: 'tip-received',                                            // Change subject: tip -> tip-received
  transform: ({ tipper, amount }) => ({ tipper, amount: amount / 20 }) // Transform event data: tokens -> US dollars
});
```

Transform functions can also return a `Promise`.

##### `forwardEvents(subjects, sender|senders, receiever|receivers, [transform]): Function`

- `subjects` `string[]` Events to forward.
- `sender|senders` `string|string[]` Can be pages or `@bot`.
- `receiver|receivers` `string|string[]` Can be pages or `@bot`.
- `transform` `object?` Transform object. Used to transform event data or to change its subject.
- Returns: `Function` Call it to cancel forwarding.

###### Example:
```js
const transmitter = new Transmitter;
const unforward = transmitter.forwardEvents(
  ['tip', 'private-show-start', 'private-show-end'], '@bot', 'statistics',
  {
    tip: {
      redirect: 'tip-received', // Change subject: tip -> tip-received
      transform: ({ tipper, amount }) => ({ tipper, amount: amount / 20 }) // Transform event data: tokens -> US dollars
    },
    $default: {
      redirect: subject => subject + 'ed' // Change subject: private-show-{start,end} -> private-show-{started,ended}
    }
  }
);
```

Transform functions can also return a `Promise`.

##### `forwardRequest(subject, sender|senders, receiver, [transform]): Function`

- `subject` `string` Request to forward.
- `sender|senders` `string|string[]` Can only be pages.
- `receiver` `string` Can only be `@bot`.
- `transform` `object?` Transform object. Used to transform request and response payload or to change subject.
- Returns: `Function` Call it to cancel forwarding.

###### Example:
```js
const transmitter = new Transmitter;
const unforward = transmitter.forwardRequest('my-request', ['page1', 'page2'], '@bot', {
  redirect: 'my-request-in-@bot', // Change subject: my-request -> my-request-in-@bot
  async transformRequest(data) { // Transform payload before it is sent to @bot
    // do something awfully asynchronous, for example
    return data;
  }
});
```

Transform functions can also return a `Promise`.

##### `forwardRequests(subjects, sender|senders, receiver, [transform]): Function`

- `subjects` `string[]` Request to forward.
- `sender|senders` `string|string[]` Can only be pages.
- `receiver` `string` Can only be `@bot`.
- `transform` `object?` Transform object. Used to transform request and response payload or to change subject.
- Returns: `Function` Call it to cancel forwarding.

###### Example:
```js
const transmitter = new Transmitter;
const unforward = transmitter.forwardRequests(
  ['my-request1', 'my-request2'], 'page8', '@bot',
  {
    'my-request1': {
      redirect: subject => subject + subject, // Redirect: my-request1 -> 'my-request1my-request1'
      transformRequest(data) { // Transform payload before it is sent to @bot
        // do anything you like
        return data;
      },
      async transformResponse(data) { // Transform response payload before getting it to sender
        /* If error response */
        if (data instanceof Transmitter.Failure) {
          console.log(`Let's log our error and pass it on untouched: `, data);
          throw data;
        }

        /* else if successul response */
        const stuff = await getSomeStuff();
        if (stuff.isBad()) {
          data.stuff = null;
          data.badStuff = true;
          throw new Transmitter.Failure(data); // Response with an error even though a successful response was received
        }

        data.stuff = stuff;
        return data;
      }
    },
    $default: {
      redirect: 'somewhere' // Redirect: my-request2 -> somewhere
    }
  }
);
```

Transform functions can also return a `Promise`.

#### Class: Failure

Re-exported from `Channel.Failure`. A subclass of `fb.Error` that represents an error response from [`sendRequest(receiver, subject, data)`](#send-requestreceiver-subject-data-promise).

##### `new Failure(data)`

- `data` `any?` `default: {}` Data to attach.

##### `name`

- `string` `=== 'Failure'`

##### `type`

- `string` `=== 'ERR_FAILURE'`

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

#### Class: Failure

Re-exported from `Channel.Failure`. A subclass of `fb.Error` that represents an error response from [`sendRequest(receiver, subject, data)`](#send-requestreceiver-subject-data-promise).

##### `new Failure(data)`

- `data` `any?` `default: {}` Data to attach.

##### `name`

- `string` `=== 'Failure'`

##### `type`

- `string` `=== 'ERR_FAILURE'`

# Server Sent Events

## Use cases

- Allows web server to push notifications to the clients
- Clients can subscribe to a SSE service
- Enable web server to be run in multiple threads
- The use of an "hanging" connect request forces to run the webserver with multiple threads

## Concept

A "hanging" request between frontend and backend connects clients to server.  
- Via a clients request `/listen`, which triggers the function `listen()`, this "hanging" request is established.
After above connection is established the server can notify the client. 
- It puts a message into this connection via `announce(msg)`.

## Implementation

To push notification to clients we implement two sse servers: 
- a first `sse_manager` which runs in web server context, and is register via `flask app extension`
- a second `sse_manager` which is started in a separate process

The SSE Manager is extending the BaseManager from pythons multiprocessing library. The manager
registers two functions

- `listen()`: returns a `Queue` that blocks until a new item is added to the SSE `stream`
- `announce(item)`: announces a new item to the SSE stream, which is put into the queue.

This two functions lock and wrap member functions of a `MessageAnnouncer` which handle queue listening 
to queues and anouncing messages.

## Deployment

We always need a multi-threaded server, to use this SSE implementation. In a single-threaded server, the long-lived connection - which transports the events via a hanging request - would block other requests from being processed until it's closed. So in the context of SSE, the server needs to use at least two threads, one thread to manage the hanging SSE connection and other thread to serve the requests. That's why we need either run flask multithreaded or to use the multithreaded waitress.

When using flask in the debugging mode, your app will be reloaded, so we have to check for this to assure SSE process is only started after reload.

## Debugging

To check socket and/or process under windows use:

````bash
tasklist | grep <pid> # check if task with pid is running
netstat -aon | findstr :<sid> # see if socket is already used
````

To send requests to the server use

````bash
curl -N http://localhost:5000/listen # for listening to the ping SSE messages
> event: PING
> data: ping
curl -s http://localhost:5000/monitor # for monitoring the SSE process
> {
>   "cpu_usage": "cpu_usage: 0.00 %",
>   "memory_usage": "34.21 MB"
> }
curl -X POST http://localhost:5000/nickname -H "Content-Type: application/json" -d '{"name": "Hund"}'
````
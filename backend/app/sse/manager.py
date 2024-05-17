"""
    Provides two threadsafe methods for serving Server-Sent Events (SSE) to
    multiple clients:
        - sse_put(item): adds a new item to the SSE stream
        - sse_listen(): returns a queue.Queue that blocks until a new item is
          added to the SSE stream
    Needs to be started in a separate process, like this:
    
    ```
    # Starting the SSE server in a separate process

    sse_process = Process(target=start_sse, daemon=True)
    sse_process.start()
    ```
"""
import logging
from multiprocessing import Lock
from multiprocessing.managers import BaseManager

from .announcer import MessageAnnouncer

logger = logging.getLogger(__name__)

# Create a custom manager class that inherits from BaseManager.
class SSEManager(BaseManager):
    pass

# start the SSE server
def start_sse(ready_event):
    try:
        logger.info("SSE -- process: start")
        lock = Lock() # Create a mutex lock to ensure thread-safe operations.
        # create annoucer object which pings the clients
        sse = MessageAnnouncer()
        
        # listens for new SSE messages. It returns a queue.Queue that blocks until a 
        # new item is added to the SSE stream
        def sse_listen():
            with lock:
                logger.info("SSE -- process: listen")
                message = sse.listen()
                logger.info(f"SSE -- received: {message}")
                return message
        
        # adds a new item to the SSE stream
        def sse_put(item):
            with lock:
                logger.info(f"SSE -- Sending SSE message: {item}")
                sse.announce(item)

        # register the methods of the SSE server
        SSEManager.register("sse_listen", sse_listen)
        SSEManager.register("sse_put", sse_put)

        # start the server, to be run in a separate process
        # Define the server's address and auth key.
        manager = SSEManager(address=("127.0.0.1", 2437), authkey=b'sse')
        logger.info(f"Manager SSE -- serving SSE server at address {manager.address}")
        ready_event.set() # Signal that the server is ready.
        server = manager.get_server()
        server.serve_forever() # Start the server to handle requests indefinitely.
    except Exception as e:
        logging.error(f"SSE Manager -- Failed to start SSE server: {e}")
    
# register the methods of the SSE server, so that they can be called from
# another process
SSEManager.register("sse_listen")
SSEManager.register("sse_put")

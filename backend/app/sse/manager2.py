import logging
from multiprocessing import Lock
from multiprocessing.managers import BaseManager

from .announcer import MessageAnnouncer  # Import the module handling the SSE broadcasting.

logger = logging.getLogger(__name__)  # Setup logging for this module.

class SSEManager(BaseManager):
    pass  # Create a custom manager class that inherits from BaseManager.

# Function to start the SSE server.
def start_sse(ready_event):
    try:
        logger.info("SSE -- process: start")  # Log the start of the SSE server process.
        lock = Lock()  # Create a mutex lock to ensure thread-safe operations.
        sse = MessageAnnouncer()  # Instantiate the SSE announcer.
        
        # Function to listen for new SSE messages.
        def sse_listen():
            with lock:  # Use the lock to ensure exclusive access to the following block.
                logger.info("SSE -- process: listen")  # Log that the server is ready to listen for messages.
                message = sse.listen()  # Block until a new message is received.
                logger.info(f"SSE -- received: {message}")  # Log the received message.
                return message  # Return the message to the caller.
        
        # Function to put a new message into the SSE stream.
        def sse_put(item):
            with lock:  # Use the lock to ensure exclusive access to the following block.
                logger.info(f"SSE -- Sending SSE message: {item}")  # Log the message to be sent.
                sse.announce(item)  # Send the message through the announcer.

        # Register the SSE server functions that can be remotely invoked.
        SSEManager.register("sse_listen", sse_listen)
        SSEManager.register("sse_put", sse_put)

        # Setup the SSE manager server.
        manager = SSEManager(address=("127.0.0.1", 2437), authkey=b'sse')  # Define the server's address and auth key.
        logger.warning(f"SSE -- serving SSE server at address {manager.address}")  # Log the address being served.
        ready_event.set()  # Signal that the server is ready.
        server = manager.get_server()  # Retrieve the server object.
        server.serve_forever()  # Start the server to handle requests indefinitely.
    except Exception as e:
        logging.error(f"Failed to start SSE server: {e}")  # Log any exceptions that occur during setup or runtime.
    
# Register the server methods so that they can be called from another process.
SSEManager.register("sse_listen")
SSEManager.register("sse_put")

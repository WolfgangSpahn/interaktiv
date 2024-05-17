# import logging
# import threading
# import time

# logger = logging.getLogger(__name__)

# def start_ping(self):
#     """Starts the periodic ping in a background thread."""
#     threading.Thread(target=self.ping_clients, daemon=True).start()

# def ping_clients(self):
#     """Sends a ping to all clients every 30 seconds."""
#     while True:
#         logger.warning("Sending ping to all clients")
#         self.broadcast("ping")
#         time.sleep(30)

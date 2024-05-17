import os
import logging
from multiprocessing import Process, Event


# -- local imports
from app.app import app, socketNr
from app.sse.manager import start_sse
from app.utils import get_ip

logger = logging.getLogger(__name__)

if __name__ == '__main__':
# --- start the SSE server
    if os.environ.get("WERKZEUG_RUN_MAIN") == "true" or not app.debug:
        logging.warning(f"serve in LAN http://{get_ip()}:{socketNr}")
        # process event to synchronize server startups, wait for SSE server to be ready
        logger.warning("We run under Werkzeug, so we are in the reloaded subprocess")
        sse_ready_event = Event()
        sse_process = Process(target=start_sse, daemon=True, args=(sse_ready_event,))
        sse_process.start()
        global_pid = sse_process.pid  # Store PID in the global variable
        logging.info(f"SSE -- Started SSE server process with PID: {global_pid}")
        sse_ready_event.wait() # wait for the server to be ready
        logger.warning("Starting Flask app")
    # Start the Flask application in a separate thread
    app.run(host='0.0.0.0', port=socketNr, threaded=True, debug=False)
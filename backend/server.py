import logging
import threading
import json
import time
import psutil
import os

from multiprocessing import Process, Event
from sse.manager import start_sse

from flask import Flask, request, jsonify, Response,send_from_directory
from flask_cors import CORS
from sse.routes import setup_sse_listen, notify_subscribers, stream
import socket

# -------------------------------------------------- Global vars

nicknames = {}
likertScores = {}
socketNr = 5050

# -------------------------------------------------- Setup logging

format='%(asctime)s - %(name)s/%(lineno)d - %(levelname)s - %(message)s '
logging.basicConfig(format=format, level=logging.WARNING)
logger = logging.getLogger(__name__)
logging.getLogger("werkzeug").setLevel(logging.ERROR)

# -------------------------------------------------- Helper functions

def get_ip():
    """
        Get the IP address of the current machine    
    """
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.settimeout(0)
    try:
        # doesn't even have to be reachable
        s.connect(('10.254.254.254', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

# --- SSE setup

def get_process_metrics(pid):
    """Get CPU and memory usage of a process given its PID."""
    logger.info(f"Getting metrics for process with PID: {pid}")
    try:
        process = psutil.Process(pid)
        cpu_usage = process.cpu_percent(interval=1.0)
        memory_usage = process.memory_info().rss / (1024 * 1024)  # MB
        return {
            "cpu_usage": f"cpu_usage: {cpu_usage:.2f} %",
            "memory_usage": f"{memory_usage:.2f} MB",
        }
    except psutil.NoSuchProcess:
        return {"error": f"Process {pid} does not exist"}

# --- Flask and SSE setup
app = Flask(__name__)
CORS(app)  # This allows all domains to access your Flask app
global_pid = None  # Global variable to store the PID of the SSE server process
sse_manager = setup_sse_listen(app) # Setup SSE listening route


# -------------------------------------------------- Event routes
# test with
# curl -X GET http://localhost:5000/events
@app.route('/events')
def events():
    """SSE endpoint for both pings and name changes."""
    return Response(stream(sse_manager), mimetype='text/event-stream')

# test with
# curl -X GET http://localhost:5000/ping
# ping is disabled
@app.route('/ping', methods=['GET'])
def ping():
    """Endpoint to simulate a ping event."""
    notify_subscribers(sse_manager,"Pinged", "PING")  # Notify subscribers of the ping event
    return "Pinged"

## ------------------------------------------------- Nickname routes

# test with 
# curl -X POST -H "Content-Type: application/json" -d '{"name":"Hund", "uuid":"123"}' http://localhost:5000/nickname
@app.route('/nickname', methods=['POST'])
def post_icon_name():
    """Receive a JSON object with a name field."""
    data = request.get_json()  # Extract JSON data from request
    if not data or 'name' not in data or 'uuid' not in data:
        return jsonify({'status': 'error', 'message': 'Missing name or uuid'}), 400
    uid = data['uuid']
    nicknames[uid] = data['name']  # Store the name in the global dictionary
    notify_subscribers(sse_manager,{"nicknames":list(nicknames.values()) }, "NICKNAME")  # Notify subscribers with the new name
    return jsonify({'status': 'success', 'message': 'Data received'}), 200

# test with
# curl -X GET http://localhost:5000/nickname/123
@app.route('/nickname/<uuid>', methods=['GET'])
def get_icon_name(uuid):
    """Return the nickname for the given uuid or None."""
    name = nicknames.get(uuid)
    if name is None:
        return jsonify({'warning': f'No name found for the given uuid: {uuid}'}), 200
    else:
        return jsonify({'nickname': name}), 200

# test with
# curl -X GET http://localhost:5000/nicknames
@app.route('/nicknames', methods=['GET'])
def get_icon_names():
    """Return the list of nicknames."""
    return jsonify({'nicknames': list(nicknames.values())}), 200

# --------------------------------------------------- Likert scale routes
# test with
# curl -X POST -H "Content-Type: application/json" -d '{"likert":3}' http://localhost:5000/likert
@app.route('/likert', methods=['POST'])
def post_likert():
    """Receive a JSON object with a likert field."""
    data = request.get_json()
    if not data or 'likert' not in data:
        return jsonify({'status': 'error', 'message': 'Missing likert'}), 400
    # copy field likert and value to a new dictionary
    update = {'likert': data['likert'], 'value': data['value']}
    
    user = data['user']
    # create or update a nested dictionary with user and likert as keys
    likertScores.setdefault(data['likert'], {})[user] = data['value']
    notify_subscribers(sse_manager, {"percentage": calcLikertPercentage(likertScores[data['likert']])} , f'A-{data["likert"]}')  # Notify subscribers with the new name
    return jsonify({'status': 'success', 'message': f'Data received for key {data["likert"]}'}), 200

# test with
# curl -X GET http://localhost:5000/likert
@app.route('/likerts', methods=['GET'])
def get_likert():
    """Return the list of likert scores."""
    return jsonify({'likert': likertScores}), 200

# get the likert score for all users and ONE likert id in percentage with 0:100%, 1:75%, 2:50%, 3:25%, 4:0%
# curl -X GET http://localhost:5000/likert/scale1
@app.route('/likert/<likert_id>', methods=['GET'])
def get_likert_scale(likert_id):
    contribution = {"0":1, "1":0.75, "2":0.5, "3":0.25, "4":0}
    """Return the list of likert scores for a specific likert id."""
    if likert_id not in likertScores:
        return jsonify({'warning': f'No likert scores found for the given likert id: {likert_id}'}), 200
    else:
        return jsonify({'likert': calcLikertPercentage(likertScores[likert_id])}), 200
        # percentage = 100 - (scores[likert_id] * 25)
        # return jsonify({'likert': percentage}), 200

def calcLikertPercentage(likertScores):
    contribution = {"0":1, "1":0.75, "2":0.5, "3":0.25, "4":0}
    # calculate the percentage of the likert score
    scores = likertScores
    contribs = [contribution[score] for score in list(scores.values())]
    # average the contributions
    percentage = sum(contribs) / len(contribs) * 100
    return round(percentage)
# ==================================================================== Answer routes
answers = {}
# post an answer identified by a uuid
# curl -X POST -H "Content-Type: application/json" -d '{"answer":"yes", "qid":"inputField1", "uuid":"123"}' http://localhost:5000/answer
@app.route('/answer', methods=['POST'])
def post_answer():
    """Receive a JSON object with a answer field."""
    data = request.get_json()
    print("Received data:", data)
    if not data or 'answer' not in data or 'uuid' not in data or 'qid' not in data:
        return jsonify({'status': 'error', 'message': 'Missing answer or uuuid or qid'}), 400
    uuid = data['uuid']
    qid = data['qid']
    if uuid not in nicknames:
        print ("nicknames:", nicknames)
        return jsonify({'status': 'error', 'message': 'Unknown uuid'}), 400
    # store the answer in a dictionary with the uuid as key, create if not exists
    d = answers.setdefault(qid, {})
    d[uuid] = data['answer']

 
    print("nicknames:", nicknames)
    print("answers:", answers)
    notify_subscribers(sse_manager, {"qid":qid,"answers": list(answers[qid].values())}, f'A-{qid}')  # Notify subscribers with the new name
    return jsonify({'status': 'success', 'message': 'Data received'}), 200
# geat all answers for a question without the uuid
# curl -X GET http://localhost:5000/answer/inputField1
@app.route('/answer/<qid>', methods=['GET'])
def get_answer(qid):
    """Return the list of answers for a question."""
    if qid not in answers:
        return jsonify({'warning': f'No answers found for the given question: {qid}'}), 200
    else:
        return jsonify({'answers': list(answers[qid].values())}), 200

# get just all answers
# curl -X GET http://localhost:5000/answers
@app.route('/answers', methods=['GET'])
def get_answers():
    """Return the list of answers for all questions."""
    return jsonify({'answers': answers}), 200


# --------------------------------------------------- Monitoring routes
# test with
# curl -X GET http://localhost:5000/threads
@app.route('/threads')
def home():
    """Give feadback about the running threads."""
    current_thread = threading.current_thread() # Get the current thread
    message = f"Handling with: {current_thread.name}, Alive: {current_thread.is_alive()}"
    threads = threading.enumerate()  # List all live threads
    thread_info = '\n - '.join(f"{thread.name} (Alive: {thread.is_alive()})" for thread in threads)
    return f'Active threads:\n - {thread_info} \n => {message}'

# test with
# curl -X GET http://localhost:5000/monitor
@app.route('/monitor')
def monitor():
    """Get the CPU and memory usage of the SSE server process."""
    if global_pid is None:
        return jsonify({"error": "SSE process not started"}), 404
    
    metrics = get_process_metrics(global_pid)
    return jsonify(metrics)

# test with
# curl -X GET http://localhost:5000/ipsocket
@app.route('/ipsocket')
def ipsocket():
    """Get the IP address and port number of the current machine."""
    return jsonify({"ip": get_ip(), "socketNr": socketNr})

# --------------------------------------------------- Static routes
# start in the browser with http://localhost:5000/
# to serve the frontend application
@app.route('/')
def serve_frontend():
    user_agent = request.headers.get('User-Agent')
    logger.info(f"User-Agent: {user_agent}")
    return send_from_directory("../docs", "index.html") # type: ignore
    
# test with, by getting the favicon
# curl -X GET http://localhost:5000/favicon.ico
# to serve all static files (including subdirectory assets)
@app.route('/<path:filename>')
def serve_static(filename):
    # logger.info(f"serve_static: {filename} from {app.static_folder}")
    logger.info(f"serve_static: {filename}")
    return send_from_directory("../docs", filename) # type: ignore
# http://localhost:5000/images/icons/animal-ant-domestic-svgrepo-com.svg

# --------------------------------------------------- Logging
@app.before_request
def log_request_info():
    # Log method, URL, headers, and body of the request
    client_ip = request.headers.get('X-Forwarded-For', request.remote_addr)
    logger.info(f"Request [{request.method}] {request.url} from {client_ip}")

# --------------------------------------------------- Main

if __name__ == '__main__':
    # --- start the SSE server
    if os.environ.get("WERKZEUG_RUN_MAIN") == "true":
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
    app.run(host='0.0.0.0', port=socketNr, threaded=True, debug=True)

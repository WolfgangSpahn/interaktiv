import psutil
import socket
import logging

logger = logging.getLogger(__name__)

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

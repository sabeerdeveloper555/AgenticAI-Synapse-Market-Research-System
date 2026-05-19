import os
os.environ["OTEL_SDK_DISABLED"] = "true"
os.environ["CREWAI_DISABLE_TELEMETRY"] = "true"
import threading
from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from dotenv import load_dotenv
from database.db import init_db, save_report, get_all_reports, get_report_by_id
from crew.research_crew import run_research

load_dotenv(override=True)

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "synapse-secret-key")
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")

init_db()


def research_worker(topic, session_id):
    def emit_log(agent, message, status="working"):
        socketio.emit(
            "agent_log",
            {"agent": agent, "message": message, "status": status},
            room=session_id,
        )

    try:
        emit_log("system", f'Starting research on: "{topic}"', "started")
        report = run_research(topic, emit_log)
        report_id = save_report(topic, report)
        socketio.emit(
            "research_complete",
            {"report": report, "report_id": report_id, "topic": topic},
            room=session_id,
        )
    except Exception as e:
        socketio.emit("research_error", {"error": str(e)}, room=session_id)


@socketio.on("connect")
def on_connect():
    emit("connected", {"status": "Synapse system ready"})


@socketio.on("start_research")
def on_start_research(data):
    topic = data.get("topic", "").strip()
    if not topic:
        emit("research_error", {"error": "Topic cannot be empty"})
        return
    session_id = request.sid
    thread = threading.Thread(
        target=research_worker, args=(topic, session_id), daemon=True
    )
    thread.start()


@app.route("/api/reports", methods=["GET"])
def list_reports():
    reports = get_all_reports()
    return jsonify(reports)


@app.route("/api/reports/<int:report_id>", methods=["GET"])
def get_report(report_id):
    report = get_report_by_id(report_id)
    if not report:
        return jsonify({"error": "Report not found"}), 404
    return jsonify(report)


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "system": "Synapse Agentic AI"})


if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True, use_reloader=False, allow_unsafe_werkzeug=True)

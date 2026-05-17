# Synapse — Agentic AI Market Research System
## Project Document

**Project Title:** Synapse — Agentic AI Market Research System
**Domain:** Artificial Intelligence / Agentic Systems
**Category:** Multi-Agent AI Application
**Tech Stack:** CrewAI · OpenAI GPT-4o-mini · Flask · React 18 · Socket.IO · SQLite

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Objectives](#3-objectives)
4. [System Architecture](#4-system-architecture)
5. [Technology Stack](#5-technology-stack)
6. [Agent Design](#6-agent-design)
7. [Backend Implementation](#7-backend-implementation)
8. [Frontend Implementation](#8-frontend-implementation)
9. [Real-Time Communication](#9-real-time-communication)
10. [Database Layer](#10-database-layer)
11. [External Tool Integration](#11-external-tool-integration)
12. [API Reference](#12-api-reference)
13. [Project Structure](#13-project-structure)
14. [Setup & Installation](#14-setup--installation)
15. [Key Features](#15-key-features)
16. [System Workflow](#16-system-workflow)
17. [Limitations & Future Enhancements](#17-limitations--future-enhancements)
18. [Conclusion](#18-conclusion)

---

## 1. Project Overview

**Synapse** is a fully autonomous, multi-agent AI market research system that takes a single user-provided topic and generates a complete, professional-grade market research report — without any further human input. The system deploys three specialized AI agents in a sequential pipeline: a **Trend Researcher**, a **Strategic Analyst**, and an **Executive Editor**. Together they collect live web data, perform SWOT and risk analysis, and compile a structured Markdown report — all streamed to the user in real time via WebSockets.

The project demonstrates the practical application of **agentic AI design patterns**: role-based agent specialization, task chaining with context passing, tool use (live web search), and human-facing real-time observability of autonomous AI workflows.

---

## 2. Problem Statement

Market research is a time-intensive, high-skill activity. A single competitive analysis report — covering market size, key trends, SWOT, risk matrix, and strategic recommendations — typically requires hours of research, synthesis, and writing. This process is:

- **Slow:** Manual research and writing takes 4–12 hours per report.
- **Expensive:** Engaging research analysts or consulting firms is costly.
- **Inconsistent:** Quality varies significantly by analyst skill and available time.
- **Opaque:** Users get a finished report but have no visibility into the process.

Synapse solves this by replacing the entire research-to-report pipeline with an autonomous multi-agent system that completes the same task in minutes — with transparent, real-time agent activity logs visible to the user.

---

## 3. Objectives

| # | Objective |
|---|---|
| 1 | Demonstrate multi-agent orchestration using CrewAI's sequential process |
| 2 | Enable fully autonomous market research from a single topic input |
| 3 | Provide real-time observability into agent activity via WebSocket streaming |
| 4 | Integrate live web search (Serper.dev) for up-to-date, factual data |
| 5 | Generate structured, professional reports in Markdown format |
| 6 | Persist reports in a local database for history and retrieval |
| 7 | Deliver a clean, responsive React frontend for end-user interaction |

---

## 4. System Architecture

The system follows a **client-server architecture** with three distinct layers:

```
┌──────────────────────────────────────────────────────────┐
│                  React Frontend (Vite)                   │
│  SearchBar │ AgentLog │ ReportViewer │ ReportHistory      │
└───────────────────────┬──────────────────────────────────┘
                        │  WebSocket (Socket.IO) + HTTP REST
┌───────────────────────▼──────────────────────────────────┐
│               Flask + Flask-SocketIO Backend              │
│  Socket.IO Handler → research_worker (daemon thread)      │
│  REST Endpoints → /api/reports                            │
│  ┌─────────────────────────────────────────────────────┐ │
│  │            CrewAI Sequential Pipeline               │ │
│  │  [Trend Researcher] → [Strategic Analyst]           │ │
│  │                     → [Executive Editor]            │ │
│  └─────────────────────────────────────────────────────┘ │
│  SQLite Database (reports.db / synapse.db)                │
└──────────────────────────┬───────────────────────────────┘
                           │  API Calls
┌──────────────────────────▼───────────────────────────────┐
│                   External Services                       │
│  OpenAI GPT-4o-mini │ Serper.dev │ Firecrawl (optional)  │
└──────────────────────────────────────────────────────────┘
```

### Architecture Principles

- **Separation of concerns:** Each agent has a single, well-defined responsibility.
- **Context passing:** Task outputs are explicitly passed as context to downstream tasks.
- **Non-blocking execution:** Research runs in a daemon thread; the Flask event loop remains responsive.
- **Event-driven UI updates:** All agent status changes are pushed to the frontend via Socket.IO events; the frontend never polls.

---

## 5. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **AI Orchestration** | CrewAI | Multi-agent workflow management, task chaining |
| **LLM** | OpenAI GPT-4o-mini | Powering all three agents |
| **LLM Client** | LangChain OpenAI | `ChatOpenAI` adapter for CrewAI agents |
| **Backend Framework** | Flask | REST API server |
| **Real-Time Layer** | Flask-SocketIO | WebSocket server for event streaming |
| **Cross-Origin** | Flask-CORS | Allowing React dev server to reach Flask |
| **Web Search** | Serper.dev API | Live Google search results for the Trend Researcher |
| **Web Scraping** | Firecrawl (optional) | Deep page content extraction |
| **Database** | SQLite | Persistent local storage for generated reports |
| **Frontend Framework** | React 18 | Component-based UI |
| **Build Tool** | Vite | Fast frontend dev server and bundler |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **Socket Client** | socket.io-client | WebSocket communication from React |
| **Env Management** | python-dotenv | Loading API keys from `.env` files |

---

## 6. Agent Design

Synapse implements three CrewAI agents, each with a distinct role, goal, backstory, and toolset. All agents use `gpt-4o-mini` with `temperature=0.3` and `allow_delegation=False`.

### 6.1 Trend Researcher

| Property | Value |
|---|---|
| **Role** | Trend Researcher |
| **LLM** | GPT-4o-mini, Temp 0.3, Max Iter 10 |
| **Tools** | `SerperSearchTool` (live web search) |
| **Goal** | Collect latest market trends, statistics, and emerging patterns using live web search |
| **Backstory** | Seasoned market intelligence analyst with 15 years scanning global data sources |

**Task Deliverable:** A 600+ word research brief containing:
- Current market size and growth rate with statistics
- Top 5–8 key trends shaping the market in 2024–2025
- Major players and competitive landscape overview
- Recent developments (last 6–12 months)
- Emerging technologies and innovations
- Key market segments and their performance

### 6.2 Strategic Analyst

| Property | Value |
|---|---|
| **Role** | Strategic Analyst |
| **LLM** | GPT-4o-mini, Temp 0.3, Max Iter 8 |
| **Tools** | None (reasoning-only agent) |
| **Goal** | Analyze raw market data to produce SWOT analysis, risk matrix, and growth opportunities |
| **Backstory** | Top-tier business strategist, MBA from Wharton, advisor to Fortune 500 companies |
| **Context** | Receives full output of the Trend Researcher task |

**Task Deliverable:** A 700+ word strategic analysis containing:
- Full SWOT matrix (4–6 points per quadrant)
- 3–5 key insights from the data
- Risk matrix (top 5 risks with probability and impact ratings)
- Growth opportunities ranked by potential value
- Competitive positioning analysis

### 6.3 Executive Editor

| Property | Value |
|---|---|
| **Role** | Executive Editor |
| **LLM** | GPT-4o-mini, Temp 0.3, Max Iter 8 |
| **Tools** | None (writing-only agent) |
| **Goal** | Transform strategic analysis into a polished, professional Markdown report |
| **Backstory** | Award-winning business journalist and former editor at McKinsey Quarterly |
| **Context** | Receives outputs of both the Trend Researcher and Strategic Analyst tasks |

**Task Deliverable:** A 1000+ word publication-ready Markdown report with nine mandatory sections:
1. Executive Summary
2. Market Overview
3. Key Market Trends
4. SWOT Analysis
5. Competitive Landscape
6. Growth Opportunities
7. Risk Assessment
8. Strategic Recommendations
9. Conclusion

---

## 7. Backend Implementation

### 7.1 Flask Application (`backend/app.py`)

The Flask application is the central hub connecting the frontend, the CrewAI pipeline, and the database.

**Key responsibilities:**
- Initialize the SQLite database on startup via `init_db()`
- Handle WebSocket connections and the `start_research` event
- Spawn a daemon thread (`research_worker`) per research session to avoid blocking the event loop
- Emit `agent_log`, `research_complete`, and `research_error` events to the correct Socket.IO room
- Serve REST endpoints for report listing and retrieval

**Socket.IO Events:**

| Event | Direction | Payload |
|---|---|---|
| `connected` | Server → Client | `{ status: "Synapse system ready" }` |
| `start_research` | Client → Server | `{ topic: string }` |
| `agent_log` | Server → Client | `{ agent, message, status }` |
| `research_complete` | Server → Client | `{ report, report_id, topic }` |
| `research_error` | Server → Client | `{ error: string }` |

**Threading model:** Each `start_research` socket event spawns a daemon thread. The thread calls `run_research()` (blocking, ~2–5 minutes), then emits results back to the originating socket room using `socketio.emit(..., room=session_id)`.

### 7.2 CrewAI Orchestration (`backend/crew/research_crew.py`)

The `run_research(topic, emit_log)` function:
1. Instantiates the three agents
2. Defines three `Task` objects with descriptions, expected outputs, agents, and context dependencies
3. Creates a `Crew` with `Process.sequential` — tasks execute in order, outputs chain forward
4. Calls `crew.kickoff()` which blocks until all three tasks complete
5. Returns the final report string

Each task has a `callback` that fires on completion, triggering a `done` log event to the frontend.

### 7.3 Custom Search Tool (`backend/tools/search_tools.py`)

`SerperSearchTool` extends `crewai_tools.BaseTool` with a Pydantic `args_schema` (`SearchInput`) for type-safe tool invocation. It posts to the Serper.dev Google Search API, extracts the top 6 organic results (title, snippet, URL), and returns them as formatted text for the LLM to process.

---

## 8. Frontend Implementation

The frontend is a single-page React 18 application built with Vite and styled with Tailwind CSS.

### 8.1 Component Hierarchy

```
App.jsx  (state hub — socket connection, active report, logs)
├── SearchBar.jsx       — Topic input + Research button
├── AgentLog.jsx        — Real-time agent activity feed
├── ReportViewer.jsx    — Rendered Markdown report + export button
└── ReportHistory.jsx   — List of past reports with load capability
```

### 8.2 State Management (`App.jsx`)

`App.jsx` owns all shared state and the Socket.IO connection. It:
- Connects to the Flask Socket.IO server on mount
- Listens for `agent_log`, `research_complete`, and `research_error` events
- Passes handlers down to child components as props
- Manages the active report, log array, and loading state

### 8.3 Components

**SearchBar.jsx** — Input field bound to local state; emits `start_research` via the socket on form submit. Disables during active research to prevent concurrent sessions.

**AgentLog.jsx** — Renders a live, scrolling feed of agent status messages. Each entry shows the agent name, message, and a color-coded status badge (`started` / `working` / `done`). Updates in real time as Socket.IO events arrive.

**ReportViewer.jsx** — Renders the completed report. Displays raw Markdown converted to HTML. Provides a download button that exports the report as a `.md` file using the Blob API.

**ReportHistory.jsx** — Fetches the report list from `GET /api/reports` on mount. Displays reports by topic and timestamp. Clicking a report loads its content via `GET /api/reports/:id` and passes it to `ReportViewer`.

---

## 9. Real-Time Communication

Synapse uses **bidirectional WebSocket communication** via Socket.IO to provide a live agent activity feed. This is critical to the user experience — research takes several minutes, and users need transparency into what is happening.

**Flow:**
1. User submits a topic → `start_research` event emitted to server
2. Server spawns a thread and immediately begins emitting `agent_log` events as each agent starts and finishes
3. On completion, `research_complete` event delivers the full report
4. On error, `research_error` event delivers the error message

The frontend never polls; all updates are server-pushed. Each session is isolated to a Socket.IO room identified by `request.sid` (the unique socket session ID), ensuring that concurrent users do not receive each other's logs.

---

## 10. Database Layer

### Schema

```sql
CREATE TABLE IF NOT EXISTS reports (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    topic      TEXT NOT NULL,
    content    TEXT NOT NULL,
    created_at TEXT NOT NULL
);
```

### Operations

| Function | SQL Operation | Returns |
|---|---|---|
| `init_db()` | `CREATE TABLE IF NOT EXISTS` | None |
| `save_report(topic, content)` | `INSERT` | `report_id` (int) |
| `get_all_reports()` | `SELECT id, topic, created_at ORDER BY id DESC` | List of dicts |
| `get_report_by_id(id)` | `SELECT * WHERE id = ?` | Dict or None |

All functions open a fresh connection, execute the query, commit (where needed), and close the connection. `conn.row_factory = sqlite3.Row` enables dict-like row access.

---

## 11. External Tool Integration

### Serper.dev (Web Search)

- **Endpoint:** `https://google.serper.dev/search`
- **Auth:** `X-API-KEY` header
- **Request:** `{ "q": query, "num": 8 }`
- **Response parsed:** `organic[]` → top 6 results (title, snippet, link)
- **Used by:** Trend Researcher agent only
- **Free tier:** 2,500 searches/month

### OpenAI GPT-4o-mini

- **Used by:** All three agents
- **Interface:** LangChain's `ChatOpenAI` wrapper
- **Configuration:** `temperature=0.3` (low randomness for factual, consistent output)
- **Auth:** `OPENAI_API_KEY` environment variable

### Firecrawl (Optional)

- Configured in the system for optional deep web page scraping
- Not wired into the default tool list in production; available for extension
- **Free tier:** 500 scrapes/month

---

## 12. API Reference

### REST Endpoints

#### `GET /api/health`
Returns system health status.

**Response:**
```json
{ "status": "ok", "system": "Synapse Agentic AI" }
```

#### `GET /api/reports`
Returns all stored reports (metadata only, no content).

**Response:**
```json
[
  { "id": 3, "topic": "Cryptocurrency Market", "created_at": "2025-05-17T10:23:00+00:00" },
  { "id": 2, "topic": "Electric Vehicles", "created_at": "2025-05-16T14:11:00+00:00" }
]
```

#### `GET /api/reports/<id>`
Returns a single report including full content.

**Response:**
```json
{
  "id": 3,
  "topic": "Cryptocurrency Market",
  "content": "# Cryptocurrency Market — Market Research Report\n...",
  "created_at": "2025-05-17T10:23:00+00:00"
}
```

**404 Response:**
```json
{ "error": "Report not found" }
```

---

## 13. Project Structure

```
SYNAPSE-AGENTIC-AI-MARKET-RESEARCH-SYSTEM/
│
├── backend/
│   ├── app.py                      # Flask + Socket.IO server, REST API, threading
│   ├── requirements.txt            # Python dependencies
│   ├── .env.example                # Environment variable template
│   │
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── trend_researcher.py     # Agent 1: web search & data gathering
│   │   ├── strategic_analyst.py    # Agent 2: SWOT & strategic analysis
│   │   └── executive_editor.py     # Agent 3: report writing & formatting
│   │
│   ├── crew/
│   │   ├── __init__.py
│   │   └── research_crew.py        # CrewAI task definitions & workflow orchestration
│   │
│   ├── tools/
│   │   ├── __init__.py
│   │   └── search_tools.py         # SerperSearchTool (custom BaseTool subclass)
│   │
│   └── database/
│       ├── __init__.py
│       └── db.py                   # SQLite init, save, and query functions
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx                # React app entry point
│   │   ├── App.jsx                 # Root component, state hub, Socket.IO client
│   │   ├── index.css               # Tailwind directives + global styles
│   │   └── components/
│   │       ├── SearchBar.jsx       # Topic input form
│   │       ├── AgentLog.jsx        # Real-time agent activity feed
│   │       ├── ReportViewer.jsx    # Markdown report renderer + export
│   │       └── ReportHistory.jsx   # Past reports browser
│   │
│   ├── package.json                # Node.js dependencies
│   ├── vite.config.js              # Vite build configuration
│   ├── tailwind.config.js          # Tailwind CSS configuration
│   ├── postcss.config.js           # PostCSS configuration
│   └── .env.example                # Frontend environment template
│
├── README.md                       # Quick-start guide and architecture diagrams
├── SYSTEM_DESIGN.md                # Detailed system design document
└── PROJECT_DOCUMENT.md             # This document
```

---

## 14. Setup & Installation

### Prerequisites

| Requirement | Minimum Version | Purpose |
|---|---|---|
| Python | 3.10+ | Backend runtime |
| Node.js | 18+ | Frontend runtime |
| OpenAI API Key | — | Powers all three AI agents |
| Serper.dev API Key | — | Live web search for Trend Researcher |

### Backend Setup

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS / Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
copy .env.example .env
# Edit .env — add OPENAI_API_KEY, SERPER_API_KEY

# 5. Run the server
python app.py
# → Listening on http://localhost:5000
```

### Frontend Setup

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install Node dependencies
npm install

# 3. Configure environment (optional — defaults to localhost:5000)
copy .env.example .env

# 4. Start dev server
npm run dev
# → Running at http://localhost:3000
```

### Environment Variables

**Backend `.env`:**
```
OPENAI_API_KEY=sk-...
SERPER_API_KEY=...
FIRECRAWL_API_KEY=...     # optional
SECRET_KEY=synapse-secret # optional, has default
```

**Frontend `.env`:**
```
VITE_BACKEND_URL=http://localhost:5000
```

---

## 15. Key Features

| Feature | Description |
|---|---|
| **Autonomous Research** | Single topic input triggers a full three-agent research pipeline with no further user interaction |
| **Real-Time Agent Log** | Users watch each agent's status update live via WebSocket — full transparency into AI reasoning process |
| **SWOT Analysis** | Strategic Analyst produces a structured four-quadrant SWOT matrix with 4–6 points per quadrant |
| **Risk Matrix** | Top 5 risks ranked by probability and business impact |
| **Professional Reports** | Nine-section Markdown reports (1000+ words) styled for executive consumption |
| **Report Export** | One-click `.md` file download of any generated report |
| **Report History** | All past reports stored in SQLite and browsable from the UI |
| **Live Web Search** | Trend Researcher pulls fresh data from Google via Serper.dev — not stale training data |
| **Session Isolation** | Each Socket.IO session is isolated by `request.sid`; concurrent users are fully independent |
| **Responsive UI** | Tailwind CSS layout works on desktop and mobile viewports |

---

## 16. System Workflow

### Step-by-Step Execution

```
1. User enters topic (e.g., "Electric Vehicle Market") and clicks Research

2. Frontend emits WebSocket event: start_research({ topic })

3. Flask server receives event, captures session ID (request.sid)

4. Flask spawns daemon thread: research_worker(topic, session_id)

5. research_worker calls run_research(topic, emit_log)

6. CrewAI initializes three agents (Trend Researcher, Strategic Analyst, Executive Editor)

7. Task 1 — Trend Researcher:
   a. Calls SerperSearchTool with targeted queries
   b. Serper.dev returns top 6 Google results per query
   c. LLM synthesizes findings into 600+ word research brief
   d. Callback emits agent_log("Trend Researcher", "done") → frontend

8. Task 2 — Strategic Analyst:
   a. Receives Task 1 output as context
   b. LLM generates full SWOT matrix, risk matrix, growth ranking
   c. Callback emits agent_log("Strategic Analyst", "done") → frontend

9. Task 3 — Executive Editor:
   a. Receives Task 1 and Task 2 outputs as context
   b. LLM writes the final 1000+ word nine-section Markdown report
   c. Callback emits agent_log("Executive Editor", "done") → frontend

10. run_research() returns the final report string

11. research_worker saves report to SQLite (returns report_id)

12. research_worker emits research_complete({ report, report_id, topic }) → frontend

13. Frontend receives event → renders report in ReportViewer tab
```

---

## 17. Limitations & Future Enhancements

### Current Limitations

| Limitation | Details |
|---|---|
| **Single concurrent session per user** | The UI disables the search bar during active research |
| **No authentication** | Any user can access any report by ID |
| **SQLite only** | Not suitable for multi-user production deployment at scale |
| **No report editing** | Generated reports cannot be edited in the UI |
| **Firecrawl not wired** | Deep web scraping capability is defined but not enabled by default |
| **Cost per report** | Each report makes ~20–40 LLM API calls (3 agents × multiple iterations) |

### Potential Future Enhancements

| Enhancement | Impact |
|---|---|
| **User authentication** | Isolate reports per user account |
| **PostgreSQL / MongoDB** | Production-grade database for multi-user deployments |
| **PDF export** | One-click professional PDF report download |
| **Competitor comparison mode** | Research two companies and generate a head-to-head report |
| **Report templates** | Allow users to choose report format (investor brief, academic, executive summary) |
| **Scheduled reports** | Recurring research jobs (e.g., weekly market updates) |
| **Firecrawl activation** | Enable deep page scraping for richer primary source data |
| **Report sharing** | Shareable links for generated reports |
| **Feedback loop** | Allow users to rate report quality to improve prompt engineering |
| **Multi-LLM support** | Switch between GPT-4o, Claude, Gemini from a settings panel |

---

## 18. Conclusion

Synapse demonstrates a complete, production-structured agentic AI system built on modern tooling. It goes beyond a simple chatbot or single-model API call to implement a genuine multi-agent workflow where specialized AI roles collaborate through structured task pipelines.

**Key engineering achievements:**
- A clean **three-agent sequential pipeline** with explicit context passing between tasks, ensuring each agent builds on the work of the previous one
- **Real-time observability** via Socket.IO, making the autonomous AI process transparent rather than a black box
- A **custom CrewAI tool** (`SerperSearchTool`) that grounds the Trend Researcher in live web data rather than LLM training knowledge
- A **full-stack architecture** with clear separation between the React frontend, Flask API layer, CrewAI orchestration, and SQLite persistence
- **Thread-safe design** that keeps the Flask event loop non-blocking while CrewAI runs its multi-step, multi-minute pipeline in a daemon thread

The result is a system that compresses what would be 4–12 hours of human analyst work into a fully automated, observable, minutes-long AI pipeline — while producing output that is structured, consistent, and immediately usable.

---

*Document prepared for: Synapse — Agentic AI Market Research System*
*Date: May 2026*

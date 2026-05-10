# Synapse – Agentic AI Market Research System

> A multi-agent AI system that autonomously conducts deep market research,
> performs SWOT analysis, and generates professional reports — powered by
> **CrewAI + OpenAI GPT-4o + Flask + React**.

---

## Architecture

### High-Level System Overview

```mermaid
graph TB
    subgraph Frontend["🖥️ Frontend — React 18 + Vite + Tailwind"]
        SB[SearchBar]
        AL[AgentLog]
        RV[ReportViewer]
        RH[ReportHistory]
        APP[App.jsx - State Hub]
        SB --> APP
        APP --> AL
        APP --> RV
        APP --> RH
    end

    subgraph Backend["⚙️ Backend — Flask + Socket.IO"]
        subgraph Crew["CrewAI Orchestrator"]
            TR[🔍 Trend Researcher]
            SA[🧠 Strategic Analyst]
            EE[✍️ Executive Editor]
            TR -->|research_output| SA
            SA -->|analysis_output| EE
        end
        REST[REST API\n/api/reports]
        DB[(SQLite\nreports.db)]
        EE --> DB
        REST --> DB
    end

    subgraph External["🌐 External Services"]
        SERPER[Serper.dev\nWeb Search]
        OPENAI[OpenAI\nGPT-4o-mini]
        FIRECRAWL[Firecrawl\nWeb Scraper]
    end

    APP <-->|WebSocket\nSocket.IO| Crew
    RH <-->|HTTP REST| REST
    TR <-->|API Call| SERPER
    Crew <-->|LLM Calls| OPENAI
    TR -.->|optional| FIRECRAWL
```

### Agent Pipeline

```mermaid
flowchart TD
    INPUT([🧑 User Input\ne.g. Cryptocurrency Market])

    subgraph TASK1["Task 1 — Market Research"]
        TR["🔍 Trend Researcher\nLLM: GPT-4o-mini | Temp: 0.3 | Max Iter: 10"]
        SEARCH[SerperSearchTool → Top 6 Google Results]
        TR <--> SEARCH
    end

    subgraph TASK2["Task 2 — Strategic Analysis"]
        SA["🧠 Strategic Analyst\nLLM: GPT-4o-mini | Temp: 0.3 | Max Iter: 8"]
    end

    subgraph TASK3["Task 3 — Report Generation"]
        EE["✍️ Executive Editor\nLLM: GPT-4o-mini | Temp: 0.3 | Max Iter: 8"]
    end

    OUTPUT1["📄 Research Brief 600+ words\n• Key statistics • 5-8 trends • Competitive landscape"]
    OUTPUT2["📊 Strategic Analysis 700+ words\n• SWOT Matrix • Risk matrix • Growth ranking"]
    OUTPUT3["📑 Markdown Report 1000+ words\n• 9 structured sections"]

    DB[(SQLite DB)]
    FRONTEND[🖥️ Frontend ReportViewer]

    INPUT --> TASK1
    TASK1 --> OUTPUT1
    OUTPUT1 -->|context| TASK2
    TASK2 --> OUTPUT2
    OUTPUT2 -->|context| TASK3
    TASK3 --> OUTPUT3
    OUTPUT3 --> DB
    OUTPUT3 --> FRONTEND
```

### Real-Time Data Flow

```mermaid
sequenceDiagram
    actor User
    participant FE as React Frontend
    participant Flask as Flask Server
    participant Crew as CrewAI Crew
    participant Serper as Serper API
    participant DB as SQLite DB

    User->>FE: Enter topic & click Research
    FE->>Flask: emit start_research(topic)
    Flask->>Crew: spawn daemon thread

    Flask-->>FE: agent_log (Trend Researcher started)
    Crew->>Serper: web_search(query)
    Serper-->>Crew: top 6 search results
    Flask-->>FE: agent_log (done ✓)

    Flask-->>FE: agent_log (Strategic Analyst started)
    Note over Crew: Analyses research output
    Flask-->>FE: agent_log (done ✓)

    Flask-->>FE: agent_log (Executive Editor started)
    Note over Crew: Generates Markdown report
    Flask-->>FE: agent_log (done ✓)

    Crew->>DB: save_report(topic, content)
    Flask-->>FE: research_complete(report, report_id)
    FE->>User: Display rendered report
```

### Component Interaction

```mermaid
graph LR
    subgraph FE["Frontend"]
        APP[App.jsx]
        SB[SearchBar]
        AL[AgentLog]
        RV[ReportViewer]
        RH[ReportHistory]
    end

    subgraph BE["Backend"]
        WS[Socket.IO Handler]
        REST[REST Endpoints]
        WORKER[research_worker\ndaemon thread]
        CREW[CrewAI Crew]
        DB[(SQLite)]
    end

    SB -->|onSearch| APP
    APP -->|logs| AL
    APP -->|report| RV
    APP -->|onLoad| RH
    APP <-->|WebSocket| WS
    RH <-->|HTTP| REST
    WS --> WORKER
    WORKER --> CREW
    CREW -->|agent_log events| WS
    CREW -->|save| DB
    REST <--> DB
```

> Full system design with detailed diagrams → [SYSTEM_DESIGN.md](SYSTEM_DESIGN.md)

---

## Prerequisites

| Tool | Purpose | Install |
|---|---|---|
| Python 3.10+ | Backend runtime | python.org |
| Node.js 18+ | Frontend runtime | nodejs.org |
| OpenAI API key | GPT-4o access | platform.openai.com |

---

## Setup & Installation

### 1. Clone / Open the project

```bash
cd "SYNAPSE-AGENTIC-AI-MARKET-RESEARCH-SYSTEM"
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env and add your OPENAI_API_KEY, SERPER_API_KEY and FIRECRAWL_API_KEY

python app.py
```

Backend runs at: `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install

# Configure environment
copy .env.example .env
# Edit .env if backend URL is different

npm run dev
```

Frontend runs at: `http://localhost:3000`

---

## Getting Free API Keys

| Service | Free Tier | Link |
|---|---|---|
| Serper.dev | 2,500 searches/month | serper.dev |
| Firecrawl | 500 scrapes/month | firecrawl.dev |

---

## Usage

1. Open `http://localhost:3000`
2. Enter a market research topic (e.g. "Cryptocurrency Market")
3. Click **Research** — watch the three AI agents work in real-time
4. View the generated report in the **Report** tab
5. Export as `.md` or browse **History** for past reports

---

## Project Structure

```
SYNAPSE-AGENTIC-AI-MARKET-RESEARCH-SYSTEM/
├── backend/
│   ├── app.py                  # Flask + Socket.IO server
│   ├── agents/
│   │   ├── trend_researcher.py
│   │   ├── strategic_analyst.py
│   │   └── executive_editor.py
│   ├── crew/
│   │   └── research_crew.py    # CrewAI orchestration
│   ├── tools/
│   │   └── search_tools.py     # Serper + Firecrawl
│   ├── database/
│   │   └── db.py               # SQLite report storage
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── components/
│   │       ├── SearchBar.jsx
│   │       ├── AgentLog.jsx
│   │       ├── ReportViewer.jsx
│   │       └── ReportHistory.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Orchestration | CrewAI |
| Intelligence | OpenAI GPT-4o |
| Backend | Flask + Flask-SocketIO |
| Frontend | React 18 + Vite + Tailwind CSS |
| Real-time | Socket.IO (WebSockets) |
| Search | Serper.dev + Firecrawl |
| Memory | SQLite |


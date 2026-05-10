# Synapse — System Design Document

> Agentic AI Market Research System

> **VS Code tip:** Install the [Markdown Preview Mermaid Support](https://marketplace.visualstudio.com/items?itemName=bierner.markdown-mermaid) extension, then press `Ctrl+Shift+V` to see all Mermaid diagrams rendered live.

---

## 1. High-Level Architecture

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                          SYNAPSE SYSTEM OVERVIEW                            ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  ┌─────────────────────────────────────────────────────────────────────┐    ║
║  │                        PRESENTATION LAYER                           │    ║
║  │                    React 18 + Vite + Tailwind CSS                   │    ║
║  │                                                                     │    ║
║  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────┐  │    ║
║  │  │  SearchBar   │  │  AgentLog    │  │ReportViewer  │  │History │  │    ║
║  │  │  (Input UI)  │  │ (Live Logs)  │  │ (MD Render)  │  │  Tab   │  │    ║
║  │  └──────┬───────┘  └──────▲───────┘  └──────▲───────┘  └───┬────┘  │    ║
║  │         │                 │                  │              │       │    ║
║  │         └─────────────────┼──────────────────┼──────────────┘       │    ║
║  │                    App.jsx (State Hub)        │                      │    ║
║  └─────────────────────────┬─────────────────────┼──────────────────────┘    ║
║                            │                     │                           ║
║                   WebSocket (Socket.IO)      REST HTTP                       ║
║                            │                     │                           ║
║  ┌─────────────────────────▼─────────────────────▼──────────────────────┐    ║
║  │                         APPLICATION LAYER                            │    ║
║  │                    Flask + Flask-SocketIO                            │    ║
║  │                                                                      │    ║
║  │   ┌──────────────────────────────────────────────────────────────┐   │    ║
║  │   │                 CrewAI Orchestrator                          │   │    ║
║  │   │                                                              │   │    ║
║  │   │  ┌──────────────┐     ┌──────────────┐     ┌─────────────┐  │   │    ║
║  │   │  │    Trend     │────▶│  Strategic   │────▶│  Executive  │  │   │    ║
║  │   │  │  Researcher  │     │   Analyst    │     │   Editor    │  │   │    ║
║  │   │  │              │     │              │     │             │  │   │    ║
║  │   │  │ [web_search] │     │  [No Tools]  │     │ [No Tools]  │  │   │    ║
║  │   │  └──────┬───────┘     └──────┬───────┘     └──────┬──────┘  │   │    ║
║  │   │         │  research_output   │  analysis_output   │ report  │   │    ║
║  │   └─────────┼───────────────────┼────────────────────┼─────────┘   │    ║
║  │             │                   │                    │             │    ║
║  └─────────────┼───────────────────┼────────────────────┼─────────────┘    ║
║                │                   │                    │                   ║
║  ┌─────────────▼──┐    ┌───────────▼───────┐  ┌────────▼─────────────────┐  ║
║  │  EXTERNAL APIs │    │  INTELLIGENCE     │  │  PERSISTENCE LAYER       │  ║
║  │                │    │                  │  │                           │  ║
║  │  Serper.dev    │    │  OpenAI GPT-4o   │  │  SQLite Database          │  ║
║  │  (Web Search)  │    │  (LLM Backbone)  │  │  (Report History)         │  ║
║  └────────────────┘    └──────────────────┘  └───────────────────────────┘  ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

### Mermaid Version

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

---

## 2. Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       COMPONENT INTERACTION MAP                             │
└─────────────────────────────────────────────────────────────────────────────┘

  Frontend Components                    Backend Components
  ─────────────────────                  ────────────────────────────────────

  ┌───────────┐                          ┌───────────────────────────────────┐
  │  App.jsx  │◄─── Socket Events ──────►│         Flask Server              │
  │           │                          │  ┌─────────────────────────────┐  │
  │  State:   │◄─── REST /api/* ────────►│  │    REST API Endpoints       │  │
  │  socket   │                          │  │  GET /api/health            │  │
  │  logs[]   │                          │  │  GET /api/reports           │  │
  │  report   │                          │  │  GET /api/reports/<id>      │  │
  │  theme    │                          │  └─────────────────────────────┘  │
  │  activeTab│                          │  ┌─────────────────────────────┐  │
  └─────┬─────┘                          │  │   Socket.IO Event Handlers  │  │
        │                               │  │  on: connect                │  │
        │ passes props                   │  │  on: start_research         │  │
        ▼                               │  │  emit: agent_log            │  │
  ┌───────────────────────────────┐      │  │  emit: research_complete    │  │
  │       Child Components        │      │  │  emit: research_error       │  │
  │                               │      │  └─────────────────────────────┘  │
  │  ┌────────────┐               │      │  ┌─────────────────────────────┐  │
  │  │ SearchBar  │ onSearch()    │      │  │   research_worker()         │  │
  │  │            ├──────────────►├──────┼─►│   (daemon thread)           │  │
  │  └────────────┘               │      │  └──────────────┬──────────────┘  │
  │                               │      │                 │                 │
  │  ┌────────────┐               │      │                 ▼                 │
  │  │  AgentLog  │◄── logs[] ───┤      │  ┌─────────────────────────────┐  │
  │  │            │               │      │  │    CrewAI Research Crew     │  │
  │  └────────────┘               │      │  │                             │  │
  │                               │      │  │  Task 1 → Task 2 → Task 3   │  │
  │  ┌──────────────┐             │      │  └─────────────────────────────┘  │
  │  │ ReportViewer │◄─ report ──┤      │                                   │
  │  │  (markdown)  │             │      │  ┌─────────────────────────────┐  │
  │  └──────────────┘             │      │  │      SQLite Database         │  │
  │                               │      │  │  save_report()              │  │
  │  ┌───────────────┐            │      │  │  get_all_reports()          │  │
  │  │ ReportHistory │◄─ REST ───►├──────┼─►│  get_report_by_id()         │  │
  │  │               │            │      │  └─────────────────────────────┘  │
  │  └───────────────┘            │      └───────────────────────────────────┘
  └───────────────────────────────┘
```

### Mermaid Version

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
        FLASK[Flask Server]
        WS[Socket.IO Handler]
        REST[REST Endpoints]
        WORKER[research_worker\ndaemon thread]
        CREW[CrewAI Crew]
        DB[(SQLite)]
    end

    SB -->|onSearch callback| APP
    APP -->|logs state| AL
    APP -->|report state| RV
    APP -->|onLoad callback| RH

    APP <-->|WebSocket| WS
    RH <-->|HTTP| REST

    WS --> WORKER
    WORKER --> CREW
    CREW -->|agent_log events| WS
    CREW -->|save| DB
    REST <--> DB
```

---

## 3. Agent Pipeline (CrewAI Sequential Flow)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CREWAI AGENT PIPELINE                                │
└─────────────────────────────────────────────────────────────────────────────┘

  User Input: "Cryptocurrency Market"
        │
        ▼
  ┌─────────────────────────────────────────────────────────────────────────┐
  │  TASK 1 — Market Research                                               │
  │  ┌────────────────────────────────────────────────────────────────┐    │
  │  │ TREND RESEARCHER                                                │    │
  │  │ Role: Market Intelligence Analyst (15 years exp)               │    │
  │  │ LLM: GPT-4o-mini  │  Temp: 0.3  │  Max Iter: 10               │    │
  │  │                                                                 │    │
  │  │  Input: Research topic from user                               │    │
  │  │  Tools: SerperSearchTool                                        │    │
  │  │          └─► Serper API → Google Search Results (top 6)       │    │
  │  │                                                                 │    │
  │  │  Output: Research brief (600+ words)                           │    │
  │  │    ├─ Key market statistics                                    │    │
  │  │    ├─ 5–8 emerging trends                                      │    │
  │  │    ├─ Competitive landscape                                    │    │
  │  │    ├─ Market segments                                          │    │
  │  │    └─ Recent innovations                                       │    │
  │  └────────────────────────────────┬───────────────────────────────┘    │
  └───────────────────────────────────┼─────────────────────────────────────┘
                                      │ research_output (context)
                                      ▼
  ┌─────────────────────────────────────────────────────────────────────────┐
  │  TASK 2 — Strategic Analysis                                            │
  │  ┌────────────────────────────────────────────────────────────────┐    │
  │  │ STRATEGIC ANALYST                                               │    │
  │  │ Role: Business Strategist (MBA, Fortune 500 Advisor)           │    │
  │  │ LLM: GPT-4o-mini  │  Temp: 0.3  │  Max Iter: 8                │    │
  │  │                                                                 │    │
  │  │  Input: Task 1 research output (via context chain)             │    │
  │  │  Tools: None (pure LLM reasoning)                              │    │
  │  │                                                                 │    │
  │  │  Output: Strategic analysis (700+ words)                       │    │
  │  │    ├─ SWOT Matrix (4–6 points per quadrant)                   │    │
  │  │    ├─ Risk matrix                                              │    │
  │  │    ├─ Growth opportunity ranking                               │    │
  │  │    ├─ Competitive positioning                                  │    │
  │  │    └─ Key strategic insights                                   │    │
  │  └────────────────────────────────┬───────────────────────────────┘    │
  └───────────────────────────────────┼─────────────────────────────────────┘
                                      │ analysis_output (context)
                                      ▼
  ┌─────────────────────────────────────────────────────────────────────────┐
  │  TASK 3 — Report Generation                                             │
  │  ┌────────────────────────────────────────────────────────────────┐    │
  │  │ EXECUTIVE EDITOR                                                │    │
  │  │ Role: Award-winning Journalist (ex-McKinsey Quarterly Editor)  │    │
  │  │ LLM: GPT-4o-mini  │  Temp: 0.3  │  Max Iter: 8                │    │
  │  │                                                                 │    │
  │  │  Input: Task 1 + Task 2 outputs (via context chain)            │    │
  │  │  Tools: None (pure LLM generation)                             │    │
  │  │                                                                 │    │
  │  │  Output: Professional Markdown Report (1000+ words)            │    │
  │  │    ├─ Executive Summary                                        │    │
  │  │    ├─ Market Overview                                          │    │
  │  │    ├─ Key Trends                                               │    │
  │  │    ├─ SWOT Analysis                                            │    │
  │  │    ├─ Competitive Landscape                                    │    │
  │  │    ├─ Growth Opportunities                                     │    │
  │  │    ├─ Risk Assessment                                          │    │
  │  │    ├─ Strategic Recommendations                                │    │
  │  │    └─ Conclusion                                               │    │
  │  └────────────────────────────────────────────────────────────────┘    │
  └─────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
                         Final Markdown Report
                         saved to SQLite + sent to Frontend
```

### Mermaid Version

```mermaid
flowchart TD
    INPUT([🧑 User Input\ne.g. Cryptocurrency Market])

    subgraph TASK1["Task 1 — Market Research"]
        TR["🔍 Trend Researcher\nRole: Market Intelligence Analyst\nLLM: GPT-4o-mini | Temp: 0.3 | Max Iter: 10"]
        SEARCH[SerperSearchTool\nSerper API → Top 6 Google Results]
        TR <--> SEARCH
    end

    subgraph TASK2["Task 2 — Strategic Analysis"]
        SA["🧠 Strategic Analyst\nRole: Business Strategist\nLLM: GPT-4o-mini | Temp: 0.3 | Max Iter: 8"]
    end

    subgraph TASK3["Task 3 — Report Generation"]
        EE["✍️ Executive Editor\nRole: Award-winning Journalist\nLLM: GPT-4o-mini | Temp: 0.3 | Max Iter: 8"]
    end

    OUTPUT1["📄 Research Brief\n600+ words\n• Key statistics\n• 5-8 trends\n• Competitive landscape"]
    OUTPUT2["📊 Strategic Analysis\n700+ words\n• SWOT Matrix\n• Risk matrix\n• Growth ranking"]
    OUTPUT3["📑 Markdown Report\n1000+ words\n• 9 structured sections"]

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

---

## 4. Real-Time Data Flow (Sequence Diagram)

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  User    │    │ Frontend │    │  Flask   │    │  CrewAI  │    │  Serper  │
│ Browser  │    │  App.jsx │    │  Server  │    │   Crew   │    │   API    │
└────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘
     │               │               │               │               │
     │  open browser │               │               │               │
     │──────────────►│               │               │               │
     │               │  connect WS   │               │               │
     │               │──────────────►│               │               │
     │               │  connected ✓  │               │               │
     │               │◄──────────────│               │               │
     │               │               │               │               │
     │  enter topic  │               │               │               │
     │──────────────►│               │               │               │
     │               │ start_research│               │               │
     │               │  (WS event)   │               │               │
     │               │──────────────►│               │               │
     │               │               │  spawn thread │               │
     │               │               │──────────────►│               │
     │               │               │               │               │
     │               │  agent_log    │               │  web_search() │
     │               │◄──────────────│◄──────────────│──────────────►│
     │               │ (Researcher   │ (Trend        │               │
     │               │   started)    │  Researcher   │  results JSON │
     │               │               │   working)    │◄──────────────│
     │               │               │               │               │
     │               │  agent_log    │               │               │
     │               │◄──────────────│◄──────────────│               │
     │               │  (working...)  │ emit logs     │               │
     │               │               │               │               │
     │               │  agent_log    │               │               │
     │               │◄──────────────│◄──────────────│               │
     │               │  (done ✓)     │               │               │
     │               │               │               │               │
     │               │  agent_log    │               │               │
     │               │◄──────────────│◄──────────────│               │
     │               │ (Analyst      │ (Strategic    │               │
     │               │   started)    │  Analyst      │               │
     │               │               │   working)    │               │
     │               │  agent_log    │               │               │
     │               │◄──────────────│◄──────────────│               │
     │               │  (done ✓)     │               │               │
     │               │               │               │               │
     │               │  agent_log    │               │               │
     │               │◄──────────────│◄──────────────│               │
     │               │  (Editor      │ (Executive    │               │
     │               │   working)    │  Editor done) │               │
     │               │               │               │               │
     │               │               │  save to DB   │               │
     │               │               │──────────────►│               │
     │               │               │  report_id    │               │
     │               │               │◄──────────────│               │
     │               │               │               │               │
     │               │research_compl.│               │               │
     │               │◄──────────────│               │               │
     │               │(report + id)  │               │               │
     │               │               │               │               │
     │  view report  │               │               │               │
     │◄──────────────│               │               │               │
     │               │               │               │               │
     │  export .md   │               │               │               │
     │──────────────►│               │               │               │
     │  download     │               │               │               │
     │◄──────────────│               │               │               │
     │               │               │               │               │
     │  history tab  │               │               │               │
     │──────────────►│  GET /api/    │               │               │
     │               │  reports      │               │               │
     │               │──────────────►│               │               │
     │               │  reports[]    │               │               │
     │               │◄──────────────│               │               │
     │  see history  │               │               │               │
     │◄──────────────│               │               │               │
└────┴─────┘    └────┴─────┘    └────┴─────┘    └────┴─────┘    └────┴─────┘
```

### Mermaid Version

```mermaid
sequenceDiagram
    actor User
    participant FE as React Frontend
    participant Flask as Flask Server
    participant Crew as CrewAI Crew
    participant Serper as Serper API
    participant DB as SQLite DB

    User->>FE: Open browser
    FE->>Flask: WebSocket connect
    Flask-->>FE: connected ✓

    User->>FE: Enter topic & click Research
    FE->>Flask: emit start_research(topic)
    Flask->>Crew: spawn daemon thread

    Flask-->>FE: agent_log (Trend Researcher started)
    Crew->>Serper: web_search(query)
    Serper-->>Crew: top 6 search results
    Flask-->>FE: agent_log (working...)
    Flask-->>FE: agent_log (done ✓)

    Flask-->>FE: agent_log (Strategic Analyst started)
    Note over Crew: Analyses research output
    Flask-->>FE: agent_log (working...)
    Flask-->>FE: agent_log (done ✓)

    Flask-->>FE: agent_log (Executive Editor started)
    Note over Crew: Generates Markdown report
    Flask-->>FE: agent_log (done ✓)

    Crew->>DB: save_report(topic, content)
    DB-->>Crew: report_id

    Flask-->>FE: research_complete(report, report_id)
    FE->>User: Display Report tab

    User->>FE: Click History tab
    FE->>Flask: GET /api/reports
    Flask->>DB: get_all_reports()
    DB-->>Flask: reports[]
    Flask-->>FE: reports[]
    FE->>User: Show report history
```

---

## 5. Database Schema

```
┌─────────────────────────────────────────────────────────────────┐
│                      SQLite: reports.db                         │
├─────────────────────────────────────────────────────────────────┤
│  Table: reports                                                 │
├──────────┬──────────┬──────────────┬────────────────────────────┤
│  Column  │  Type    │  Constraint  │  Description               │
├──────────┼──────────┼──────────────┼────────────────────────────┤
│  id      │ INTEGER  │ PRIMARY KEY  │  Auto-increment ID         │
│          │          │ AUTOINCREMENT│                            │
├──────────┼──────────┼──────────────┼────────────────────────────┤
│  topic   │ TEXT     │ NOT NULL     │  User's research topic     │
├──────────┼──────────┼──────────────┼────────────────────────────┤
│  content │ TEXT     │ NOT NULL     │  Full Markdown report      │
├──────────┼──────────┼──────────────┼────────────────────────────┤
│ created_at│ TEXT    │ NOT NULL     │  ISO 8601 timestamp        │
└──────────┴──────────┴──────────────┴────────────────────────────┘

  DB Operations:
  ┌─────────────────────────────────────────────────────────────┐
  │  save_report(topic, content)   → report_id                  │
  │  get_all_reports()             → [{id, topic, created_at}]  │
  │  get_report_by_id(id)          → {id, topic, content, ...}  │
  └─────────────────────────────────────────────────────────────┘
```

---

## 6. Technology Stack Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TECHNOLOGY STACK                                  │
├─────────────────────┬───────────────────────────────────────────────────────┤
│  Layer              │  Technology                                           │
├─────────────────────┼───────────────────────────────────────────────────────┤
│  Frontend UI        │  React 18 + Vite + Tailwind CSS                      │
├─────────────────────┼───────────────────────────────────────────────────────┤
│  Markdown Render    │  react-markdown + remark-gfm                         │
├─────────────────────┼───────────────────────────────────────────────────────┤
│  Real-time Comms    │  Socket.IO (WebSocket protocol)                      │
├─────────────────────┼───────────────────────────────────────────────────────┤
│  Backend Server     │  Flask + Flask-SocketIO                              │
├─────────────────────┼───────────────────────────────────────────────────────┤
│  Multi-Agent AI     │  CrewAI (sequential pipeline)                        │
├─────────────────────┼───────────────────────────────────────────────────────┤
│  LLM Intelligence   │  OpenAI GPT-4o-mini                                  │
├─────────────────────┼───────────────────────────────────────────────────────┤
│  Web Search         │  Serper.dev API (Google Search)                      │
├─────────────────────┼───────────────────────────────────────────────────────┤
│  Web Scraping       │  Firecrawl API (configured, optional)                │
├─────────────────────┼───────────────────────────────────────────────────────┤
│  Persistence        │  SQLite (embedded, file-based)                       │
├─────────────────────┼───────────────────────────────────────────────────────┤
│  Threading          │  Python threading (daemon thread per research job)   │
└─────────────────────┴───────────────────────────────────────────────────────┘
```

---

## 7. Key Design Decisions

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  DESIGN DECISION          │  CHOICE               │  REASON                │
├───────────────────────────┼───────────────────────┼────────────────────────┤
│  Agent Communication      │  Sequential (CrewAI)  │  Each agent builds on  │
│                           │  not parallel         │  prior agent's output  │
├───────────────────────────┼───────────────────────┼────────────────────────┤
│  Real-time Updates        │  WebSocket (Socket.IO)│  Push model; avoids   │
│                           │  not polling          │  repeated HTTP polls   │
├───────────────────────────┼───────────────────────┼────────────────────────┤
│  Background Processing    │  Daemon Thread        │  Keeps Flask responsive│
│                           │  not async/await      │  while agents run      │
├───────────────────────────┼───────────────────────┼────────────────────────┤
│  Persistence              │  SQLite               │  Zero-config; sufficient│
│                           │  not PostgreSQL       │  for single-user system│
├───────────────────────────┼───────────────────────┼────────────────────────┤
│  Tool Access              │  Only Trend Researcher│  Search is only needed │
│                           │  has web_search       │  at the data-gathering │
│                           │                       │  stage                 │
├───────────────────────────┼───────────────────────┼────────────────────────┤
│  LLM Temperature          │  0.3 for all agents   │  Consistent, factual   │
│                           │                       │  outputs over creative │
└───────────────────────────┴───────────────────────┴────────────────────────┘
```

---

## 8. System Boundaries & External Dependencies

```
                    ┌─────────────────────────────┐
                    │   SYNAPSE SYSTEM BOUNDARY    │
                    │                             │
  ┌──────────┐      │  ┌──────────┐ ┌──────────┐  │      ┌──────────────┐
  │  User's  │◄────►│  │ React    │ │  Flask   │  │◄────►│ OpenAI API   │
  │ Browser  │      │  │ Frontend │ │ Backend  │  │      │ (GPT-4o-mini)│
  └──────────┘      │  └──────────┘ └──────────┘  │      └──────────────┘
                    │         │          │          │
                    │         │          │          │      ┌──────────────┐
                    │         └──── DB ──┘          │◄────►│  Serper.dev  │
                    │          SQLite               │      │ (Web Search) │
                    │                             │      └──────────────┘
                    │                             │
                    │                             │      ┌──────────────┐
                    │                             │◄────►│  Firecrawl   │
                    │                             │      │  (optional)  │
                    └─────────────────────────────┘      └──────────────┘

  Ports:
    Frontend  →  http://localhost:3000
    Backend   →  http://localhost:5000
    WebSocket →  ws://localhost:5000 (Socket.IO)
```

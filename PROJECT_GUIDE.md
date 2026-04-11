# 🧪 Green-Compute: The Ultimate In-Depth Guide

This document provides a comprehensive technical breakdown of every component, file, and logic flow in the Green-Compute project. It is designed to prepare you for a professional presentation or technical viva.

---

## 💡 Project Philosophy
**Green-Compute** solves the "Carbon Spike" problem in AI. Standard AI workloads run the moment they are requested, regardless of whether the electricity grid is currently powered by coal or wind. This project introduces **Adaptive Scheduling**, which uses AI agents to negotiate execution times based on grid carbon intensity forecasts.

---

## 🏗️ Core Architecture & Logic

### 1. The Carbon Intelligence Engine
The system's "Decision IQ" comes from how it interprets grid data.
- **P30 Strategy**: The system doesn't just look for "low" intensity; it looks for the **lowest 30%** of the next 48 hours. By calculating this percentile, the system ensures it always picks the "greenest windows" available in the near future.

### 2. Multi-Agent Orchestration (LangGraph)
Unlike linear scripts, Green-Compute uses a **State Graph**. The task moves through "Nodes" (Agents), and each node can modify the task's state or decide it needs to pause.
- **Triage**: Uses LLM reasoning to classify sensitivity.
- **Scheduler**: The "Gatekeeper" that compares real-time telemetry vs. P30 targets.

---

## 📂 Exhaustive File-by-File Directory

### 🌍 Root
- `docker-compose.yml`: Orchestrates the containerized version of the app (Database + Backend + Frontend).
- `.gitignore`: Prevents sensitive data (.env) and heavy folders (node_modules) from being uploaded to GitHub.
- `package.json`: Main project configuration for Node environments.

### ⚙️ Backend (`backend/app/`)
#### `/agents`
- `graph.py`: **Entry Point for Logic.** Defines the "map" of how a task travels from Triage to Completion.
- `nodes.py`: **The Workers.** Contains the actual Python functions for each agent (Triage logic, Scheduler math, Execution simulation).
- `state.py`: **The Memory.** Defines the `AgentState` dictionary—what data "travels" with the task as it moves through the graph.

#### `/core`
- `carbon_service.py`: **Data Fetcher.** Contains the `UKCarbonProvider` class that makes HTTP requests to the UK Grid API and calculates the P30 threshold.
- `config.py`: **Settings.** Uses `pydantic-settings` to manage environment variables like API keys and database URLs.
- `llm.py`: **AI Connector.** Logic to initialize Gemini or OpenAI, including the **MockLLM** fallback I built for you.

#### `/db`
- `models.py`: **Database Structure.** Defines the Tables (`Task`, `TaskEvent`, `CarbonHistory`) using SQLModel.
- `service.py`: **Database Controller.** Functions to `create_task`, `get_task`, and `log_event`.

#### `/schemas`
- `task.py`: **Data Format.** Defines the JSON structure for API requests and responses (e.g., what fields the website expects to see).

#### `/utils`
- `reporting.py`: **PDF Generator.** Uses `FPDF` to draw the ESG report and `qrcode` to generate signable verification links.
- `security.py`: **Trust Layer.** Handles the HMAC-SHA256 logic to ensure certificates aren't tampered with.

#### `/workers`
- `main.py`: **The Background Engine.** A standard loop that keeps tasks alive while the main API is busy.

#### `main.py`
- **The API Router.** The central script that handles incoming website requests (POST task, GET status).

### 💻 Frontend (`frontend/src/`)
- `main.tsx`: The starting point that mounts the React app into the HTML.
- `App.tsx`: **The Main Layout.** Manages the tabs (Dashboard vs Verification) and global task state.
- `api.ts`: **The Bridge.** Centralized Axios configuration for calling your Python backend.
- `index.css`: **Visual Identity.** Contains the "True Black" theme and glassmorphism styling.

#### `/components`
- `CarbonWidget.tsx`: **Data Visualization.** Displays the 48h intensity graph and the "DIRTY/GREEN" status indicator.
- `TaskBoard.tsx`: **User Interaction.** The input field for dispatching jobs and the data table showing the queue.

#### `/pages`
- `VerificationPage.tsx`: **Scanner Destination.** The "mobile-first" page that opens when someone scans a certificate QR code.

---

## 🚀 How to Run (Direct Instructions)

### 1. Prerequisite Checklist
- [ ] Install **Python 3.10+**
- [ ] Install **Node.js 18+**
- [ ] Git Bash or PowerShell terminal

### 2. Backend Boot-up
```powershell
# 1. Enter folder
cd C:\Users\tanu1\Desktop\Green_Compute\backend

# 2. Setup environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# 3. Install packages
pip install -r requirements.txt

# 4. Start Server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*Wait until you see "Uvicorn running on http://0.0.0.0:8000"*

### 3. Frontend Boot-up (New Terminal)
```powershell
# 1. Enter folder
cd C:\Users\tanu1\Desktop\Green_Compute\frontend

# 2. Install site tools
npm install

# 3. Start Site
npm run dev
```
*Wait for "Vite dev server running at http://localhost:3006/"*

### 4. Direct Access
- **Dashboard**: http://localhost:3006
- **API Documentation**: http://localhost:8000/docs (FastAPI Swagger UI)

---

## 🛠️ Performance & Scalability
- **Concurrency**: The system uses `asyncio`, allowing it to handle hundreds of tasks simultaneously without blocking.
- **Persistence**: Using **SQLite** ensures that even if the power goes out, your tasks and carbon savings are saved in `greencompute.db`.

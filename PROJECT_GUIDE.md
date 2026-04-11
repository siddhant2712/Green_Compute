# 🧪 Green-Compute: The Ultimate Project Thesis & Technical Manual

This document is the definitive technical authority for the **Green-Compute** ecosystem. It covers the architectural design, algorithmic logic, and operational instructions required for a professional presentation, technical viva, or high-level audit.

---

## 🏛️ 1. Project Philosophy & Motivation

### The Problem
AI is energy-intensive. Training a single large model can emit as much CO₂ as five cars over their lifetimes. Most AI systems run tasks immediately upon request, often during "Peak Dirty Hours" when the electricity grid relies on coal or gas.

### The Solution: Green-Compute
Green-Compute is a **Carbon-Aware Middleware**. It decouples the *request time* from the *execution time*. By utilizing regional grid forecasts, it intelligently pauses "deferrable" AI workloads until the grid is powered by renewables (Wind, Solar, Nuclear).

---

## 🛠️ 2. The Master Tech Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Backend Framework** | **FastAPI (Python)** | High-performance, asynchronous, and provides automatic Swagger documentation. |
| **Orchestration** | **LangGraph** | Enables "Stateful Multi-Agent" workflows that can pause, loop, and resume intelligently. |
| **Intelligence** | **Gemini 1.5 Flash** | Used for Triage (classifying task urgency) and Report Generation. |
| **Database** | **SQLModel / SQLite** | Combines SQLAlchemy with Pydantic for clean, persistent local storage. |
| **Frontend** | **React (Vite)** | Modern, fast, and component-based UI development. |
| **Styling** | **Tailwind CSS v4** | Advanced utility-first CSS for premium 'Pro' aesthetics. |
| **Visualizations** | **Recharts** | Interactive, high-fidelity SVG graphs for carbon telemetry. |
| **Security** | **HMAC-SHA256** | Cryptographic signing for ESG certificates to prevent tampering. |

---

## 🧠 3. Project "Brain": Multi-Agent Logic (LangGraph)

Unlike standard scripts, we use a **State Graph** (`agents/graph.py`). Every task follows a lifecycle:

1.  **Triage Node**: The agent analyzes the `input_data`. If the user says "ASAP" or "URGENT", it marks the task for immediate execution. Otherwise, it defaults to "Deferrable".
2.  **Scheduler Node**: The most critical node. It fetches live grid data and compares the `current_intensity` against the `P30_threshold`.
    -   *If Current <= P30*: The task moves to **Execution**.
    -   *If Current > P30*: The graph sets `is_paused = True` and saves the state to the DB.
3.  **Execution Node**: Simulates the AI workload, calculates actual carbon saved, and marks the task as `COMPLETED`.

---

## 📈 4. The Intelligence: P30 Scheduling Math

The system uses a **P30 (30th Percentile) Strategy** to define "Green Energy."

*   **Logic**: We fetch the 48-hour intensity forecast from the National Grid.
*   **Calculation**: We calculate the 30th percentile of these values. For example, if the grid fluctuates between 50g and 250g, the P30 might be **80g**.
*   **Target**: Any value below 80g is considered "Optimal Green." We only run deferrable tasks during these windows.
*   **Safety Net**: Every task has a `deadline` (Default 24h). If the deadline is reached and the grid is still dirty, we run the task anyway to ensure service reliability.

---

## 📂 5. Exhaustive Directory Structure

### ⚙️ Backend (`backend/app/`)
-   `main.py`: The entry point. Handles the API routes (`/tasks`, `/carbon`, `/certificate`).
-   `agents/graph.py`: Defines the LangGraph workflow structure.
-   `agents/nodes.py`: The actual Python logic for each agent (Triage, Scheduler, Exec).
-   `core/carbon_service.py`: Connects to the **National Grid ESO API**.
-   `core/llm.py`: Manages AI connections (Gemini) and the **MockLLM** fallback.
-   `db/models.py`: Defines the database schema (SQLModel).
-   `utils/reporting.py`: Generates the **ESG Carbon Certificates (PDF)**.
-   `utils/security.py`: Handles **HMAC signing** and QR code data verification.
-   `workers/main.py`: The background process that re-checks paused tasks every 60 seconds.

### 💻 Frontend (`frontend/src/`)
-   `App.tsx`: The layout engine and Tab-based navigation controller.
-   `components/dashboard/`: Contains the high-fidelity Pro Dashboard cards.
    -   `StatusOrb.tsx`: The glowing status indicator.
    -   `IntensityGraph.tsx`: The 48h forecast chart.
    -   `ActiveTasksCard.tsx`: The running workload list.
-   `components/tabs/`: Contains the page views (Compute, Reports, Settings).
-   `api.ts`: Centralizes all Axios calls to the backend.

---

## 🔌 6. API Reference

### Internal (Our App)
-   `GET /carbon`: Returns live grid intensity, P30 threshold, and "GREEN/DIRTY" status.
-   `POST /tasks`: Submits a new AI workload for orchestration.
-   `GET /tasks`: Lists all historical tasks (used for persistence).
-   `GET /certificate/{id}`: Generates a signed PDF sustainability receipt.

### External (Our Sources)
-   **UK Carbon Intensity API**: Public resource providing real-time grid data.
-   **Google Gemini API**: Provides the reasoning capabilities for our agents.

---

## 🏁 7. How to Run (Master Instructions)

### Backend
1.  `cd backend`
2.  `python -m venv venv` 
3.  `source venv/bin/activate` (or `.\venv\Scripts\Activate.ps1`)
4.  `pip install -r requirements.txt`
5.  `uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`

### Frontend
1.  `cd frontend`
2.  `npm install`
3.  `npm run dev` (Runs on http://localhost:5173)

---

## ❓ 8. Frequently Asked Questions (Viva Prep)

**Q: How is this "Agentic"?**
A: It's agentic because the software uses LLM reasoning to decide *when* to execute a task based on dynamic environment data (carbon intensity), rather than following a hard-coded script.

**Q: What happens if the Gemini API key is missing?**
A: The system automatically falls back to a **MockLLM** I built. It simulates the AI reasoning so the project remains fully functional for demonstrations.

**Q: How do you prevent data loss on page reload?**
A: We use a persistent **SQLite database**. Every time the frontend loads, it calls `GET /tasks` to restore the entire history and state of all workloads.

**Q: Is the certificate authentic?**
A: Yes. Every certificate is signed using **HMAC-SHA256** with a secret key. If the data is changed, the signature will no longer match, making it audit-proof.

# Unbound Hackathon: Agentic Workflow Builder

**Submission for the Unbound Hackathon (Feb 5)**  
GitHub Repository:  
https://github.com/NithinVikas-AV/23PC27_NithinVikasAV_Unbound

---

## Overview

The **Agentic Workflow Builder** allows users to create, configure, run, and monitor multi-step AI workflows.

Each workflow step:

1. Calls an LLM via the **Unbound API**
2. Checks completion criteria
3. Passes context to the next step
4. Retries automatically if criteria fail

This system automates the chaining of AI agents, eliminating manual copy-pasting between steps.

---

## Architecture

**Backend**

- FastAPI
- LangChain
- In-memory workflow execution engine

**Frontend**

- React
- Vite
- Axios
- React Hook Form

---

## Core Features

### Backend Features

#### Workflow Creation & Storage

- Create workflows with multiple steps
- Each step includes:
  - Model
  - Prompt
  - Completion criteria
- Stored in memory (persists during runtime)

#### Workflow Execution

- Sequential step execution
- Each step:
  - Calls Unbound API
  - Evaluates completion criteria
  - Passes context to next step

#### Completion Criteria

Supports rule-based checks:

- `contains:string`
- `regex:pattern`
- `json`
- `code`

#### LLM Judge Fallback

- For natural language criteria
- Uses a second LLM call
- Returns **YES/NO** decision

#### Context Passing

- Extracts relevant output (e.g., code blocks)
- Automatically passes to next step

#### Retry Handling

- Configurable max retries per step
- Default: **3 retries**

#### API Endpoints

| Method | Endpoint               | Description          |
| ------ | ---------------------- | -------------------- |
| POST   | `/workflows`           | Create workflow      |
| GET    | `/workflows`           | List workflows       |
| GET    | `/workflows/{id}`      | Get workflow details |
| POST   | `/workflows/{id}/run`  | Run workflow         |
| GET    | `/executions/{run_id}` | Get execution logs   |

---

### Frontend Features

- Interactive workflow creation
- Model selection dropdown
- Real-time progress logs
- Execution history
- Download workflow JSON
- Dark themed UI

---

## Tech Stack

**Backend**

- Python 3.12
- FastAPI
- LangChain
- Pydantic
- python-dotenv

**Frontend**

- React
- Vite
- Axios
- react-hook-form

**LLM Integration**

- Unbound API
- Kimi models

**Storage**

- In-memory dictionaries
- No database

---

## Setup Instructions

### Clone Repository

```bash
git clone https://github.com/NithinVikas-AV/23PC27_NithinVikasAV_Unbound.git
cd 23PC27_NithinVikasAV_Unbound
```

### Backend Setup

```bash
cd Backend
python -m venv venv
venv\Scripts\activate
pip install fastapi uvicorn langchain langchain-openai pydantic python-dotenv
```

Create `.env`:

```
UNBOUND_API_KEY=your_api_key_here
UNBOUND_API_BASE=https://api.getunbound.ai/v1
MAX_RETRIES_PER_STEP=3
```

Run backend:

```bash
uvicorn app:app --reload --port 8000
```

### Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

## Notes

- Uses Unbound API with Kimi models
- In-memory storage (resets on restart)
- Hackathon-focused implementation

---

## Contact

If you have any questions or issues, feel free to reach out.

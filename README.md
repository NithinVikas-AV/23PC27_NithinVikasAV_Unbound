Unbound Hackathon: Agentic Workflow Builder
This is a complete submission for the Unbound Hackathon (Feb 5). It implements an Agentic Workflow Builder system where users can create, configure, run, and monitor multi-step AI workflows. Each step involves calling an LLM via the Unbound API, checking completion criteria, passing context to the next step, and handling retries. The system automates chaining AI agents, eliminating manual copy-pasting between steps.
The backend is built with FastAPI and LangChain for workflow execution, while the frontend is a React app with Vite for a user-friendly interface. The project meets all core requirements: create/configure workflows, define criteria, run with progress tracking, view history/logs. No bonus features were implemented, as per the user's instruction.
Features
Backend Features

Workflow Creation & Storage: Create and save workflows with multiple steps (model, prompt, completion criteria). Stored in-memory (persists during runtime).
Workflow Execution: Run workflows sequentially. Each step calls the Unbound API with the selected model and prompt.
Completion Criteria Checking: Supports rule-based checks:
contains:string (e.g., contains:def add)
regex:pattern (e.g., regex:\b42\b)
json (validates if output is JSON)
code (checks for code keywords like def, return)

LLM Judge Fallback: For natural language criteria (e.g., "The response should contain a valid Python function"), uses a second LLM call to judge YES/NO.
Context Passing: Automatically extracts relevant parts of output (e.g., code blocks) and passes to next step as context.
Retries: Configurable max retries per step (default 3) if criteria fail. Logs retry count.
Live Progress Tracking: Stores execution state and logs per run (prompt, output, passed/failed, retries).
Endpoints:
POST /workflows: Create workflow
GET /workflows/{id}: Get workflow details
POST /workflows/{id}/run: Run workflow, returns status/run_id
GET /executions/{run_id}: Get full logs for a run
GET /workflows: List all saved workflows

CORS Enabled: Allows frontend access from localhost:5173
Environment Config: Uses .env for Unbound API key and base URL

Frontend Features

Workflow Creation & Configuration: Interactive form to add/remove steps, select model from dropdown, write prompt, define criteria.
Centered Layout: All content (form, results) is centered on the page.
Run Workflows: Create and run in one click, or run existing workflows from Home page.
Real-Time Progress & Logs: Shows workflow ID, run ID, status (creating/running/completed/failed), step-by-step logs (output, passed/failed, retries) on the page.
Workflow List on Home Page: Fetches and shows all saved workflows with "Run Now" and "Download JSON" buttons.
Execution History: Lists past run IDs on Home page; click "View Logs" to load full step logs.
No Manual ID Entry: All operations (run, view logs) use buttons — no copying IDs.
Error Handling: Shows errors (e.g., network issues) on the page.
Responsive Inline Styling: Dark theme, clean design without Tailwind (as per progress).

What It Can Do

Chain AI Steps: E.g., Step 1: Generate code; Step 2: Test it; Step 3: Summarize results.
Flexible Criteria: Rule-based or natural language (e.g., "valid Python function").
Context Handoff: Automatically passes cleaned output to next step.
Progress Monitoring: See each step's status and output live.
History Viewing: Review past runs and their logs from Home page.
Download Workflows: Export workflow definition as JSON for sharing/version control.
Retry Handling: Auto-retries failed steps up to limit.
Model Selection: Dropdown for available Unbound models.

Tech Stack

Backend: Python 3.12, FastAPI, LangChain, Pydantic, dotenv
Frontend: React, Vite, react-hook-form, Axios
LLM Integration: Unbound API (OpenAI-compatible, with Kimi models)
Storage: In-memory (dicts) — persists during runtime, resets on restart
No Database: Simple in-memory for hackathon speed

Setup Instructions

Clone the Repository:textgit clone <your-github-repo-url>
cd unbound-hackathon
Backend Setup:
Navigate to backend folder:textcd Backend
Create virtual environment:textpython -m venv venv
venv\Scripts\activate
Install dependencies:textpip install fastapi uvicorn langchain langchain-openai pydantic python-dotenv
Create .env file in Backend folder:textUNBOUND_API_KEY=c87829d8a0dd941e60fa2a2e265728f039534d4061b36f6a572159678eab3bca8829550ada87bc4f496d150dc4d0420a
UNBOUND_API_BASE=https://api.getunbound.ai/v1
MAX_RETRIES_PER_STEP=3
Run the backend:textuvicorn app:app --reload --port 8000

Frontend Setup:
Navigate to frontend folder:textcd ../frontend
Install dependencies:textnpm install
Run the frontend:textnpm run dev
Open http://localhost:5173 in browser


Running the Project

Backend: Runs on http://localhost:8000 (API docs at /docs)
Frontend: Runs on http://localhost:5173
Create a workflow in frontend → run → see progress/logs on the page

Testing with Postman

Creating a Workflow:
POST: http://localhost:8000/workflows
Headers: Content-Type: application/json
Body (raw JSON):JSON{
    "name": "Test Calculator Generator",
    "steps": [
        {
            "model": "fireworks-ai/kimi-k2-instruct-0905",
            "prompt": "Write a simple Python function called add(a, b) that returns a + b.",
            "completion_criteria": "contains:def add"
        },
        {
            "model": "fireworks-ai/kimi-k2-instruct-0905",
            "prompt": "Given this function:\n{context}\n\nCall it with add(40, 2) and tell me the result.",
            "completion_criteria": "contains:42"
        }
    ]
}
Output: { "id": "some-uuid" }

Running a Workflow:
POST: http://localhost:8000/workflows/{workflow_id}/run
No body needed
Output: { "status": "completed", "run_id": "some-run-id" }

Getting Execution Logs:
GET: http://localhost:8000/executions/{run_id}
No body needed
Output: JSON with history array (prompts, outputs, criteria, etc.)

List Workflows:
GET: http://localhost:8000/workflows
Output: Array of workflows

Walkthrough: Creating a workflow in frontend, configuring steps, running it, viewing live progress/logs, listing workflows, downloading JSON, viewing past executions.
Explains how backend handles execution, criteria, context passing.
Mentions Unbound API + Kimi models used.

If you have any questions or issues, reach out!
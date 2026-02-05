from fastapi import FastAPI, HTTPException
from models import Workflow
from fastapi.middleware.cors import CORSMiddleware
from storage import save_workflow, get_workflow, get_execution_history
from workflow_engine import execute_workflow
from uuid import uuid4
from datetime import datetime
from dotenv import load_dotenv
import os

# Load .env file (only needed in development)
load_dotenv()

# Access variables
UNBOUND_API_KEY = os.getenv("UNBOUND_API_KEY")
UNBOUND_API_BASE = os.getenv("UNBOUND_API_BASE")

if not UNBOUND_API_KEY:
    raise ValueError("UNBOUND_API_KEY is missing in .env file")
if not UNBOUND_API_BASE:
    raise ValueError("UNBOUND_API_BASE is missing in .env file")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/workflows")
def create_workflow(workflow: Workflow):
    if workflow.id is None:
        workflow.id = str(uuid4())
    save_workflow(workflow)
    return {"id": workflow.id}

@app.get("/workflows/{workflow_id}")
def read_workflow(workflow_id: str):
    workflow = get_workflow(workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow

@app.post("/workflows/{workflow_id}/run")
def run_workflow(workflow_id: str):
    workflow = get_workflow(workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    run_id = f"{workflow_id}_{datetime.now().isoformat()}"
    result = execute_workflow(workflow, run_id)
    return result

@app.get("/executions/{run_id}")
def get_execution(run_id: str):
    history = get_execution_history(run_id)
    return {"history": history}
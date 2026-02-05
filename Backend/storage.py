from models import Workflow, ExecutionLog
from typing import Dict, List

workflows: Dict[str, Workflow] = {}
execution_history: Dict[str, List[ExecutionLog]] = {}  # Keyed by run_id (e.g., workflow_id + timestamp)

def save_workflow(workflow: Workflow):
    workflows[workflow.id] = workflow

def get_workflow(workflow_id: str) -> Workflow:
    return workflows.get(workflow_id)

def log_execution(run_id: str, log: ExecutionLog):
    if run_id not in execution_history:
        execution_history[run_id] = []
    execution_history[run_id].append(log)

def get_execution_history(run_id: str) -> List[ExecutionLog]:
    return execution_history.get(run_id, [])
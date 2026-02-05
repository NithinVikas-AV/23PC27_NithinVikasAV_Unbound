from pydantic import BaseModel
from typing import List, Optional, Dict

class Step(BaseModel):
    model: str  # e.g., "gpt-3.5-turbo" or Unbound model name
    prompt: str  # Prompt template, e.g., "Write a Python calculator function. Previous context: {context}"
    completion_criteria: str  # Simple string for now, e.g., "contains:def calculate" or "regex:\d+"

class WorkflowCreate(BaseModel):          # ← New model for creation
    name: str
    steps: List[Step]

class Workflow(BaseModel):
    id: Optional[str] = None
    name: str
    steps: List[Step]

class ExecutionLog(BaseModel):
    workflow_id: str
    step_index: int
    input_prompt: str
    llm_output: str
    passed_criteria: bool
    retry_count: int = 0
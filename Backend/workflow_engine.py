import os
import re
import json
from typing import Any

from dotenv import load_dotenv
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI

from models import Step, ExecutionLog
from storage import log_execution

load_dotenv()

def get_llm(model_name: str) -> ChatOpenAI:
    return ChatOpenAI(
        model=model_name,
        openai_api_key=os.getenv("UNBOUND_API_KEY"),
        openai_api_base=os.getenv("UNBOUND_API_BASE"),
        temperature=0.7,
        max_tokens=2048,
    )

def extract_relevant_content(output: str) -> str:
    """
    Try to extract the most relevant part (usually code block).
    Falls back to full output if nothing matches.
    """
    # Try to extract python code block
    code_match = re.search(r'```python\s*(.*?)```', output, re.DOTALL | re.IGNORECASE)
    if code_match:
        return code_match.group(1).strip()

    # Try any code block (language optional)
    any_code_match = re.search(r'```(\w+)?\s*(.*?)```', output, re.DOTALL | re.IGNORECASE)
    if any_code_match:
        return any_code_match.group(2).strip()

    # Fallback: full output trimmed
    return output.strip()


def check_criteria(output: str, criteria: str) -> bool:
    """
    More robust criteria checking
    """
    criteria = criteria.strip().lower()

    if criteria.startswith("contains:"):
        term = criteria.split("contains:", 1)[1].strip()
        return term in output.lower()

    elif criteria.startswith("regex:"):
        pattern = criteria.split("regex:", 1)[1].strip()
        try:
            return bool(re.search(pattern, output, re.IGNORECASE | re.DOTALL))
        except re.error:
            return False  # invalid regex → fail safely

    elif criteria == "json":
        try:
            json.loads(output.strip())
            return True
        except json.JSONDecodeError:
            return False

    elif criteria == "code":
        # Very basic check: has def, class, import or { / [ blocks
        return any(kw in output.lower() for kw in ["def ", "class ", "import ", "{", "[", "return "])

    # Default: treat as contains
    return criteria in output.lower()


def execute_workflow(workflow, run_id: str) -> dict:
    context = ""  # accumulated context

    max_retries = int(os.getenv("MAX_RETRIES_PER_STEP", 3))

    for i, step in enumerate(workflow.steps):
        llm = get_llm(step.model)

        # Build prompt with context placeholder
        prompt_template = PromptTemplate.from_template(
            step.prompt + "\n\nPrevious context:\n{context}"
        )

        # Modern LCEL chain
        chain = prompt_template | llm

        # Format the full prompt for logging
        full_prompt = prompt_template.format(context=context)

        # First attempt
        response = chain.invoke({"context": context})
        output = response.content.strip()

        # Check if it passes
        passed = check_criteria(output, step.completion_criteria)
        retry_count = 0

        # Retry loop
        while not passed and retry_count < max_retries:
            retry_count += 1
            response = chain.invoke({"context": context})
            output = response.content.strip()
            passed = check_criteria(output, step.completion_criteria)

        # Log the attempt
        log = ExecutionLog(
            workflow_id=workflow.id,
            step_index=i,
            input_prompt=full_prompt,
            llm_output=output,
            passed_criteria=passed,
            retry_count=retry_count
        )
        log_execution(run_id, log)

        if not passed:
            return {
                "status": "failed",
                "failed_at_step": i,
                "reason": f"criteria not met after {retry_count} retries",
                "run_id": run_id
            }

        # Extract relevant part for next step
        relevant_part = extract_relevant_content(output)
        context += "\n\n" + relevant_part

    return {"status": "completed", "run_id": run_id}
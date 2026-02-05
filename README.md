Unbound Hackathon

BackEND:

https://unboundsecurity.notion.site/Unbound-Hackathon-Feb-5-2fd7e55b6e6780948bfee2910b18a3a3

app.py: Main FastAPI app.
models.py: Pydantic models for workflows and steps.
workflow_engine.py: Logic for executing workflows using LangChain.
storage.py: Simple storage for workflows and execution history.

uvicorn app:app --reload --port 8000

Testing in POSTMAN: 1. Creating a Workflow:
POST: http://localhost:8000/workflows
Headers: Content-Type application/json

        json: (raw, JSON)
        {
            "name": "Test Calculator Generator",
            "steps": [
                {
                    "model": "fireworks-ai/kimi-k2-instruct-0905",
                    "prompt": "Write a simple Python function called add(a, b) that returns a + b.",
                    "completion_criteria": "contains:def add"
                },
                {
                    "model": "fireworks-ai/kimi-k2-instruct-0905",
                    "prompt": "Given this function from previous step:\n{context}\n\nNow call add(40, 2) and tell me what the result is.",
                    "completion_criteria": "contains:42"
                }
            ]
        }

        Output:
            {
            "id": "4ed4e373-1651-4856-a3f0-0731d0202869"
            }

    2. Testing Workflow and getting run-id:
        POST: http://localhost:8000/workflows/<work-flow-id>/run

        No body or header Needed.

        Output:
            {
            "status": "completed",
            "run_id": "4ed4e373-1651-4856-a3f0-0731d0202869_2026-02-05T10:42:06.779432"
        }


    3.
        GET: http://localhost:8000/executions/4ed4e373-1651-4856-a3f0-0731d0202869_2026-02-05T10:42:06.779432

        Output:
            {
    "history": [
        {
            "workflow_id": "4ed4e373-1651-4856-a3f0-0731d0202869",
            "step_index": 0,
            "input_prompt": "Write a simple Python function called add(a, b) that returns a + b.\n\nPrevious step output (if any):\n",
            "llm_output": "```python\ndef add(a, b):\n    return a + b\n```",
            "passed_criteria": true,
            "retry_count": 0
        },
        {
            "workflow_id": "4ed4e373-1651-4856-a3f0-0731d0202869",
            "step_index": 1,
            "input_prompt": "Given this function from previous step:\n\n\n```python\ndef add(a, b):\n    return a + b\n```\n\nNow call add(40, 2) and tell me what the result is.\n\nPrevious step output (if any):\n\n\n```python\ndef add(a, b):\n    return a + b\n```",
            "llm_output": "Calling `add(40, 2)` returns `42`.",
            "passed_criteria": true,
            "retry_count": 0
        }
    ]

}


FrontEND:

/src/pages/Workflows.tsx – list + create button
/src/pages/WorkflowEditor.tsx – form for steps (add/remove steps, model dropdown, prompt, criteria)
/src/pages/RunView.tsx – show progress + logs in real time
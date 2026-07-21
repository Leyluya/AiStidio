# Integration README (updated)

This directory contains the FastAPI-based tool wrapper so AI agents can call finance functions via HTTP.

Quickstart (easiest — no package renaming required)

1. Install dependencies (from project root):
   pip install -r feature/generate-ai-poc/requirements.txt

2. Run the API using the provided wrapper (from repo root):
   uvicorn feature_generate_ai_poc_app:app --reload --port 8000

   This wrapper adds the feature/generate-ai-poc directory to PYTHONPATH so imports inside the package work even though the folder name includes a hyphen.

Alternative (app-dir)

If you prefer to run directly from the package directory, run from repo root:

   uvicorn --app-dir feature/generate-ai-poc integration.finance_tool_api:app --reload --port 8000

Notes for agents
- The API is educational and must include disclaimers in responses.
- For heavy usage consider running behind a process manager and restricting access.

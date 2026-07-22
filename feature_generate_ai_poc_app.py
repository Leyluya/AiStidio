"""
Wrapper module to make the FastAPI app importable without renaming the feature/generate-ai-poc
folder or changing PYTHONPATH manually.

Usage:
    uvicorn feature_generate_ai_poc_app:app --reload --port 8000

This script inserts the feature/generate-ai-poc path into sys.path and imports the FastAPI app
from integration.finance_tool_api inside that directory.
"""
import os
import sys

HERE = os.path.dirname(__file__)
# repo root is HERE
FEATURE_DIR = os.path.join(HERE, 'feature', 'generate-ai-poc')
if os.path.isdir(FEATURE_DIR):
    if FEATURE_DIR not in sys.path:
        sys.path.insert(0, FEATURE_DIR)
else:
    # fallback: look for path relative in case running from different cwd
    alt = os.path.join(os.getcwd(), 'feature', 'generate-ai-poc')
    if os.path.isdir(alt) and alt not in sys.path:
        sys.path.insert(0, alt)

# import the FastAPI app
try:
    from integration.finance_tool_api import app  # type: ignore
except Exception as e:
    # Raise a clear error so users see the problem when uvicorn starts
    raise RuntimeError(f"Failed to import app from integration.finance_tool_api: {e}")

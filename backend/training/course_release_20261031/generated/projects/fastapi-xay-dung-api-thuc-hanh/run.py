"""Read local lab settings; start with python -m uvicorn run:app --host 127.0.0.1."""
import json
import os
from app import create_app

raw_tokens = os.environ.get("LAB_TOKENS_JSON")
if not raw_tokens:
    raise RuntimeError("Set LAB_TOKENS_JSON to local demo token/user pairs; see README")
try:
    tokens = json.loads(raw_tokens)
except json.JSONDecodeError as exc:
    raise RuntimeError("LAB_TOKENS_JSON must be valid JSON") from exc
if not isinstance(tokens, dict):
    raise RuntimeError("LAB_TOKENS_JSON must be an object")
app = create_app(os.environ.get("LAB_DATABASE_PATH", "lab_tasks.sqlite3"), tokens)

from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
from uuid import uuid4
from typing import Optional
import time
import os

app = FastAPI(title="AiStidio Generate AI - PoC")

# Simple in-memory job store for PoC
JOBS = {}

MODEL_SERVER = os.environ.get("MODEL_SERVER_URL", "http://localhost:8001")

class GenerateRequest(BaseModel):
    mode: str
    model: Optional[str] = "default"
    prompt: str
    params: Optional[dict] = {}
    user_id: Optional[str] = "anonymous"

class JobStatus(BaseModel):
    job_id: str
    status: str
    result: Optional[dict] = None

@app.post("/api/generate")
async def generate(req: GenerateRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid4())
    JOBS[job_id] = {"status":"queued", "result": None, "created_at": time.time()}
    # Start background task to simulate generation
    background_tasks.add_task(_process_job, job_id, req.dict())
    return {"job_id": job_id, "status": "queued"}

@app.get("/api/generate/{job_id}")
async def get_job(job_id: str):
    job = JOBS.get(job_id)
    if not job:
        return {"error": "job not found"}
    return {"job_id": job_id, "status": job["status"], "result": job["result"]}

@app.get("/api/models")
async def list_models():
    # PoC: return a small list
    return {"models": ["poc-small-th", "sdxl-poc", "tts-poc"]}

async def _process_job(job_id: str, payload: dict):
    JOBS[job_id]["status"] = "running"
    # Simulate inference latency
    time.sleep(1)
    mode = payload.get("mode")
    prompt = payload.get("prompt")
    # Mock outputs depending on mode
    if mode == "text":
        result = {"text": f"(PoC) สร้างข้อความจาก prompt: {prompt}"}
    elif mode == "image":
        # In real setup, call SD server and store file to object storage
        result = {"image_url": "/assets/poc_image.png", "note": "mock image"}
    elif mode == "audio":
        result = {"audio_url": "/assets/poc_audio.mp3", "note": "mock audio"}
    else:
        result = {"text": f"(PoC) Unknown mode '{mode}', echo: {prompt}"}
    JOBS[job_id]["status"] = "succeeded"
    JOBS[job_id]["result"] = result

@app.get("/api/health")
async def health():
    return {"status": "ok", "model_server": MODEL_SERVER}

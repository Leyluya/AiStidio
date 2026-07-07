# PoC API routes
- POST /api/generate { mode, model, prompt, params, user_id }
- GET /api/generate/{job_id}
- GET /api/models

Backend: FastAPI app at backend/
Frontend: Vite React app at frontend/

To run (dev):
  cp .env.example .env
  docker-compose up --build

Notes:
- This is a minimal PoC. Connect a real model server and object storage for production.

-- Simple table for storing generate history (PoC)
CREATE TABLE IF NOT EXISTS generate_history (
  id SERIAL PRIMARY KEY,
  job_id VARCHAR(64) UNIQUE NOT NULL,
  user_id VARCHAR(128),
  mode VARCHAR(32),
  prompt TEXT,
  result JSONB,
  status VARCHAR(32),
  created_at TIMESTAMP DEFAULT now()
);

---
name: Feature: Generate AI — ระบบสร้างเนื้อหา (self-hosted) + เว็บ UI (รองรับภาษาไทย)
about: เพิ่มฟีเจอร์ Generate AI แบบ self-hosted (PoC) — ใช้เป็น template สำหรับสร้าง issue
labels: enhancement, feature/generate-ai, self-hosted
---

## สรุป

- เพิ่มฟีเจอร์ "Generate AI" เพื่อให้ผู้ใช้สร้างเนื้อหาอัตโนมัติแบบ self‑hosted ผ่านเว็บ UI รองรับภาษาไทยและโมดาลิตี้หลายชนิด (เริ่มต้น: ข้อความ, รูปภาพ, เสียง, โค้ด) โดยรันโมเดลบนโครงสร้างพื้นฐานของโปรเจคเอง (ไม่พึ่ง SaaS ภายนอก)

## เป้าหมายหลัก

- ให้ผู้ใช้ระบุ prompt และตั้งค่าพื้นฐาน เพื่อสร้างผลลัพธ์ (text/image/audio/code) ผ่านเว็บ UI
- เก็บประวัติ (history) และ prompt templates
- รันโมเดลแบบ self‑hosted (เลือก/สลับ model serving ได้)
- ระบบความปลอดภัยพื้นฐาน (moderation) และการจำกัดการใช้งาน

## ขอบเขตงาน (PoC)

- โมดาลิตี้เริ่มต้น: ข้อความ (Thai), รูปภาพ (SDXL), เสียง TTS เบื้องต้น, โค้ด (ตัวอย่าง)
- Frontend: React (Vite) — หน้า /generate, /history, /settings
- Backend: FastAPI — API เป็นตัวกลางสื่อสารกับ model serving
- Model serving: self‑hosted (TGI/vLLM/SD server) — PoC ใช้ mock แล้วค่อยต่อจริง
- Storage: S3‑compatible (assets), PostgreSQL สำหรับ metadata/history
- Deployment: Docker‑compose สำหรับ PoC

## ตัวอย่าง API (เบื้องต้น)

- POST /api/generate
  - payload: { mode: "text"|"image"|"audio"|"code", model: "model-name", prompt: "...", params: {...}, user_id }
  - response: { job_id, status }
- GET /api/generate/{job_id}
- GET /api/models
- POST /api/moderation/check

## UI flow (สั้น)

- /generate: เลือกโมดาลิตี้, เลือก model, ใส่ prompt, กด Generate
- /history: ดูรายการ, ดาวน์โหลด, re‑run
- /settings: ตั้งค่า model server, storage, moderation

## Acceptance criteria (PoC)

- Generate ข้อความภาษาไทยผ่าน UI (ผล mock/real) และเก็บประวัติ
- Generate รูปภาพ (SD) และดาวน์โหลดไฟล์ได้ (mock -> integrate)
- Model serving รันภายในเครือข่าย (ไม่เรียก SaaS โดยค่าเริ่มต้น)
- Basic moderation และ basic tests + CI

## เทคโนโลยีที่แนะนำ (PoC)

- Backend: FastAPI (Python)
- Frontend: React + Vite (+ Tailwind ต่อได้)
- Model serving: TGI / vLLM / SD server (self‑hosted)
- DB: PostgreSQL, Queue: Redis, Storage: MinIO (S3)
- Infra: Docker‑compose → K8s

## Milestones (ย่อ)

- M0: สเปค final
- M1: PoC API + UI (text) — branch: feature/generate-ai/poc
- M2: Integrate self‑hosted models
- M3: เพิ่ม image/audio/code
- M4: Hardening & deploy

## Checklist (สำหรับ Issue → แยกเป็น tasks/PRs)

- [ ] สร้าง branch feature/generate-ai/poc (PoC) — เสร็จแล้ว
- [ ] เพิ่ม backend API stub + dockerfile
- [ ] เพิ่ม frontend page /generate (text)
- [ ] เพิ่ม history DB schema + migrations
- [ ] CI: build/test basic
- [ ] PR review + merge
- [ ] เปิด issue ย่อยสำหรับแต่ละโมดูล (image, audio, code)
- [ ] เขียน docs การติดตั้ง model self‑hosted

## คำถามที่ต้องตอบก่อนเริ่มจริง

- ยืนยันโมดาลิตี้ลำดับความสำคัญ (text/image/audio/code)
- มี dataset fine‑tune ภาษาไทยไหม?
- ทรัพยากรฮาร์ดแวร์ (GPU) ที่มีหรือไม่?
- นโยบายความปลอดภัย/เนื้อหา (blocklist/allowed)?
- ต้องการ auth (SSO) หรือ local accounts ใน PoC?

---

*ไฟล์นี้สร้างโดย GitHub Copilot Chat Assistant — ใช้เป็น template เพื่อเปิด Issue ของฟีเจอร์ Generate AI*
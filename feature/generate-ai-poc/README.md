# AiStidio - Generate AI PoC

โครงงานตัวอย่างสำหรับ feature/generate-ai (PoC)

โครงสร้างไฟล์ในสาขา feature/generate-ai/poc:
- backend/: FastAPI stub
- frontend/: React + Vite skeleton
- docker-compose.yml: รัน backend + frontend (พอร์ตตัวอย่าง)
- .env.example: ตัวแปรที่ต้องตั้งค่าก่อนรัน
- db/schema.sql: ตาราง history อย่างง่าย

วิธีรัน (PoC, เครื่องพัฒนา):
1. ก๊อปไฟล์ .env.example เป็น .env และปรับค่า
2. docker-compose up --build
3. เปิด http://localhost:5173 เพื่อทดสอบ UI

หมายเหตุ: โมเดล server ยังเป็น mock/endpoint ที่ต้องตั้งค่าใน .env

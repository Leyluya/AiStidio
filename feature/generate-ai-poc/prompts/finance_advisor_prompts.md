# Prompt templates for finance advisor (Thai)

## Quick reply: สรุปสถานะการเงิน

Prompt:
"คุณมีข้อมูลรายรับ-รายจ่ายดังนี้: <paste CSV or summary>. กรุณาสรุปสถานะการเงินโดยย่อ (net worth, average monthly savings rate, top 3 หมวดค่าใช้จ่าย) พร้อมคำแนะนำการปรับปรุง 3 ข้อที่ทำได้จริงใน 30 วัน" 

## Request budgeting plan

Prompt:
"ขอให้ช่วยสร้างแผนงบประมาณรายเดือนสำหรับรายได้สุทธิ <amount> บาท โดยใช้กฎ 50/30/20 และให้ตัวอย่างการแจกจ่าย (needs, wants, savings) และแนะนำหมวดหมู่ที่ควรลดเพื่อเพิ่มการออม" 

## Debt payoff advice

Prompt:
"ฉันมีหนี้ดังนี้: <list debts as name, balance, rate>. ช่วยเสนอแผนการชำระหนี้ 2 แบบ (snowball และ avalanche) พร้อมประมาณเวลาที่คาดว่าจะชำระหมดถ้าใช้จ่าย <monthly_payment> บาท ต่อเดือน" 

## Transaction mapping help

Prompt:
"แนบตัวอย่างไฟล์ธุรกรรม (CSV) กรุณาจัดหมวดหมู่รายการที่พบ  และให้สรุปค่าใช้จ่ายต่อหมวดในเดือนล่าสุด พร้อมระบุ 10 ธุรกรรมที่เป็น outliers (สูงสุด)" 

## Disclaimers (auto-append)

Append to all responses:
"คำแนะนำนี้เป็นข้อมูลทั่วไปเท่านั้นและไม่ใช่คำปรึกษาทางการเงินที่มีใบอนุญาต หากต้องการคำแนะนำเฉพาะบุคคลเกี่ยวกับการลงทุน ภาษี หรือกฎหมาย โปรดปรึกษาผู้เชี่ยวชาญที่มีใบอนุญาต"

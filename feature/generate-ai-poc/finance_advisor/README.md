# Finance Advisor README (Thai)

บทนำ

ชุดโค้ดนี้เป็นชุดเครื่องมือช่วยให้ AI Agent หรือผู้ใช้สามารถทำงานด้านการวางแผนการเงินส่วนบุคคลแบบพื้นฐานได้ เช่น การจัดงบประมาณ การจัดหมวดหมู่รายการจ่าย วางแผนการชำระหนี้ และคำนวณมูลค่าสุทธิ (net worth)

คำเตือน / ขอบเขต

- นี่เป็นคำแนะนำทั่วไปเท่านั้น ไม่ใช่คำปรึกษาทางการเงินที่มีใบอนุญาต
- สำหรับคำแนะนำด้านการลงทุน ภาษี หรือกฎหมาย โปรดปรึกษาผู้เชี่ยวชาญที่มีใบอนุญาต

ไฟล์สำคัญ
- finance_advisor/ — โค้ดหลัก (budgeting, transaction_mapper, debt_plan, networth)
- sample_data/bank_sample.csv — ข้อมูลตัวอย่าง
- templates/ — เทมเพลตสำหรับ Google Sheet และหมวดหมู่ค่าใช้จ่าย
- prompts/ — prompt template สำหรับ AI Agent (ภาษาไทย)
- analysis/ — ตัวอย่างสคริปต์วิเคราะห์

การติดตั้ง

pip install -r feature/generate-ai-poc/requirements.txt

ตัวอย่างการใช้งาน (Python)

from finance_advisor import budget_50_30_20
print(budget_50_30_20(30000))

Contributing

Pull requests ยินดีรับเสมอ — โปรดเขียน unit tests สำหรับฟังก์ชันใหม่

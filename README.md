# Weather Dashboard

เว็บดูสภาพอากาศ ทำจาก HTML, CSS, JavaScript ดึงข้อมูลจาก OpenWeatherMap API
(ใบงานที่ 5: Working with JSON & Public API)

## สิ่งที่ทำได้
- ค้นหาอากาศปัจจุบันของเมือง (อุณหภูมิ ความชื้น ลม ความกดอากาศ)
- พยากรณ์ 5 วัน และกราฟอุณหภูมิสูงสุด/ต่ำสุด
- มี Loading และแสดง Error เมื่อไม่พบเมือง / API Key ผิด / Internet หลุด
- พิมพ์หลายเมืองคั่นด้วย , ได้ เช่น `Bangkok, Chiang Mai, Phuket` (ใช้ Promise.all)

## ไฟล์
- index.html - โครงหน้าเว็บ
- style.css - หน้าตา
- app.js - เรียก API อ่าน JSON และแสดงผล
- assets/ - เก็บรูป (ยังไม่ได้ใช้)

## วิธีรัน
1. สมัคร API Key ฟรีที่ https://openweathermap.org/api
2. เปิด app.js แล้วเปลี่ยน `YOUR_API_KEY` เป็น key ของตัวเอง
3. เปิด index.html ในเบราว์เซอร์ พิมพ์ชื่อเมืองภาษาอังกฤษแล้วกดค้นหา

หมายเหตุ: ใน repo นี้ไม่ได้ใส่ API Key จริงไว้

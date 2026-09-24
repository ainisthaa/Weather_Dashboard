# Weather Dashboard

เว็บแอปพลิเคชันแสดงสภาพอากาศ สร้างด้วย HTML, CSS และ JavaScript โดยดึงข้อมูลจาก Public API ของ [OpenWeatherMap](https://openweathermap.org/api) (ใบงานที่ 5: Working with JSON & Public API)

## ฟีเจอร์

- ค้นหาสภาพอากาศปัจจุบันของเมืองที่ต้องการ (อุณหภูมิ ความชื้น ความเร็วลม ความกดอากาศ)
- พยากรณ์อากาศ 5 วัน พร้อมกราฟอุณหภูมิสูงสุด/ต่ำสุด (วาดด้วย Canvas)
- แสดงสถานะ Loading และจัดการ Error ด้วย `try/catch` (ไม่พบเมือง, API Key ผิด, Internet หลุด)
- ใช้ `async/await` กับ Fetch API
- Optional: พิมพ์หลายเมืองคั่นด้วย `,` เช่น `Bangkok, Chiang Mai, Phuket` เพื่อเรียกพร้อมกันด้วย `Promise.all()`

## โครงสร้างโปรเจกต์

```
weather-dashboard/
├── index.html   # โครงสร้างหน้าเว็บ
├── style.css    # สไตล์
├── app.js       # Logic: Fetch API, อ่าน JSON, แสดงผลบน DOM
└── assets/      # รูปภาพ (ถ้ามี)
```

## วิธีใช้งาน

1. สมัครบัญชีฟรีที่ https://openweathermap.org/api แล้วคัดลอก API Key (key ใหม่อาจใช้เวลาสักครู่กว่าจะ Active)
2. เปิดไฟล์ `app.js` แล้วแทนที่ `YOUR_API_KEY` ที่บรรทัดแรกด้วย API Key ของคุณ
3. เปิด `index.html` ในเบราว์เซอร์ พิมพ์ชื่อเมือง (ภาษาอังกฤษ) แล้วกด "ค้นหา"

> อย่า commit API Key จริงขึ้น GitHub

## การทำงาน

```
ผู้ใช้พิมพ์เมือง → JavaScript → fetch() → OpenWeatherMap API → JSON → อ่านค่า (เช่น data.main.temp) → อัปเดต DOM → Dashboard
```

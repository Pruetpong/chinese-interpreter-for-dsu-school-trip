# 🐛 คู่มือการ Debug API Error

เอกสารนี้แสดงวิธีการตรวจสอบและแก้ไขปัญหาขั้นพื้นฐานสำหรับ Chatbot API Error

## 📋 Quick Diagnostics

### 1. ตรวจสอบ Configuration (แนะนำให้ทำก่อน)

เข้าถึง config check endpoint:
```
https://your-site.netlify.app/api/config-check
```

endpoint นี้จะแสดง:
- ✅ Provider ที่กำลังใช้งาน
- ✅ API Key status (แสดงเฉพาะบางส่วน)
- ✅ Configuration ปัจจุบัน
- ⚠️ คำเตือนและข้อแนะนำ

**ตัวอย่าง Response:**
```json
{
  "status": "ok",
  "provider": {
    "name": "OpenAI",
    "type": "openai",
    "baseURL": "https://api.openai.com/v1",
    "model": "gpt-4o-mini"
  },
  "apiKeys": {
    "hasApiKey": true,
    "apiKeyPreview": "sk-proj...xyz1"
  },
  "health": {
    "configured": true,
    "ready": true,
    "warnings": 0,
    "errors": 0
  },
  "recommendations": []
}
```

### 2. ตรวจสอบ Browser Console

1. กด **F12** เพื่อเปิด Developer Tools
2. ไปที่แท็บ **Console**
3. ส่งข้อความในแชท
4. ดู error messages

**Error ที่พบบ่อย:**

```
❌ Error: HTTP 500: API_KEY environment variable is not configured
→ แก้ไข: ตั้งค่า API_KEY ใน Netlify Environment Variables

❌ Error: HTTP 401: Unauthorized
→ แก้ไข: API Key ไม่ถูกต้องหรือหมดอายุ

❌ Error: HTTP 429: Rate Limit Exceeded
→ แก้ไข: รอสักครู่หรือเติมเงินในบัญชี

❌ Error: Failed to fetch
→ แก้ไข: ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต
```

### 3. ตรวจสอบ Network Tab

1. กด **F12** เปิด Developer Tools
2. ไปที่แท็บ **Network**
3. Filter เลือก **Fetch/XHR**
4. ส่งข้อความในแชท
5. คลิกที่ request ชื่อ **chat**
6. ดู **Response** tab

**สิ่งที่ควรตรวจสอบ:**
- Status Code (ควรเป็น **200**)
- Response Body (ถ้า error จะมี error message)
- Request Headers
- Request Payload

---

## 🔧 Quick Fixes

### Fix 1: ตั้งค่า API_KEY (กรณีพบบ่อยสุด)

**อาการ:** แชทบอทแสดง error ทันทีหลังส่งข้อความ

**วิธีแก้:**
1. ไปที่ [Netlify Dashboard](https://app.netlify.com/)
2. เลือก Site ของคุณ
3. ไปที่ **Site settings** → **Environment variables**
4. คลิก **Add a variable**
5. เพิ่ม:
   - **Key:** `API_KEY`
   - **Value:** `sk-...` (API key ของคุณ)
6. **Save**
7. รอ 1-2 นาที (Netlify restart functions อัตโนมัติ)

### Fix 2: เปลี่ยน Provider เป็น Deepseek

**ทำไมต้องเปลี่ยน:** Deepseek ถูกกว่า OpenAI มาก (~20 เท่า)

**วิธีเปลี่ยน:**
1. สมัคร Deepseek ที่ https://platform.deepseek.com/
2. สร้าง API Key
3. ตั้งค่าใน Netlify Environment Variables:
   ```
   LLM_PROVIDER=deepseek
   API_KEY=sk-... (Deepseek API Key)
   OPENAI_API_KEY=sk-... (Optional: สำหรับ TTS/Whisper fallback)
   ```

### Fix 3: เปิด Debug Mode

**เพื่อดู detailed logs:**

ตั้งค่าใน Netlify Environment Variables:
```
DEBUG_LLM=true
```

จากนั้นดู logs:
```bash
netlify functions:log chat
```

หรือดูใน Netlify Dashboard → Functions → chat → Recent logs

---

## 🧪 ทดสอบด้วย curl

### Test 1: Health Check
```bash
curl https://your-site.netlify.app/api/health
```

**ผลลัพธ์ที่ควรได้:**
```json
{"status":"ok","message":"Netlify Functions are running"}
```

### Test 2: Config Check
```bash
curl https://your-site.netlify.app/api/config-check
```

**ผลลัพธ์ที่ควรได้:**
```json
{
  "status": "ok",
  "health": {
    "configured": true,
    "ready": true
  }
}
```

### Test 3: Chat API
```bash
curl -X POST https://your-site.netlify.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "system", "content": "You are helpful"},
      {"role": "user", "content": "Hello"}
    ]
  }'
```

**ผลลัพธ์ที่ควรได้:**
```json
{"content":"Hello! How can I help you today?"}
```

---

## 📊 การอ่าน Error Messages ใหม่

จากการอัปเดตล่าสุด ตอนนี้แชทบอทจะแสดง error ที่ละเอียดขึ้น:

| Error Message | สาเหตุ | วิธีแก้ |
|--------------|--------|---------|
| ⚠️ ตรวจพบปัญหาการตั้งค่า API Key | ไม่มี API_KEY | ตั้งค่า API_KEY ใน Netlify |
| ⚠️ เซิร์ฟเวอร์เกิดข้อผิดพลาด | Server error (500) | ตรวจสอบ API Key และ Provider config |
| 🔐 API Key ไม่ถูกต้องหรือหมดอายุ | Unauthorized (401) | สร้าง API Key ใหม่ |
| ⏱️ ใช้งานเกินจำนวนที่กำหนด | Rate limit (429) | รอสักครู่หรือเติมเงิน |
| 🌐 ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ | Network error | ตรวจสอบอินเทอร์เน็ต |

---

## 🔍 ตรวจสอบใน Development Mode

### วิธีรัน Local Development:

```bash
# 1. Clone repository
git clone <your-repo-url>
cd chinese-interpreter-for-dsu-school-trip

# 2. Install dependencies
npm install

# 3. สร้าง .env.local
cp .env.local.example .env.local

# 4. แก้ไข .env.local
nano .env.local

# 5. ใส่ API Key
LLM_PROVIDER=openai
API_KEY=sk-your-api-key-here

# 6. รัน development server
npm run dev:netlify

# 7. เปิดเว็บที่
http://localhost:8888
```

---

## 📞 ขั้นตอนการ Report ปัญหา

ถ้าทำตามทุกขั้นตอนแล้วยังมีปัญหา กรุณา collect ข้อมูลเหล่านี้:

### 1. Config Check Response
```bash
curl https://your-site.netlify.app/api/config-check > config.json
```

### 2. Browser Console Log
```
1. กด F12
2. ไปที่ Console tab
3. Copy error messages ทั้งหมด
```

### 3. Network Response
```
1. กด F12
2. ไปที่ Network tab
3. คลิกที่ request "chat"
4. Copy Response
```

### 4. Netlify Function Logs
```bash
netlify functions:log chat > function-logs.txt
```

### 5. Environment Variables (ห้ามส่ง API Key จริง!)
```
LLM_PROVIDER=openai
API_KEY=sk-proj...xyz (แสดงเฉพาะบางส่วน)
MODEL_NAME=gpt-4o-mini
DEBUG_LLM=true
```

---

## 🎯 Checklist การแก้ปัญหา

ก่อน report ปัญหา ให้ทำตาม checklist นี้:

- [ ] เช็ค `/api/config-check` endpoint
- [ ] ตรวจสอบว่ามี `API_KEY` ใน Netlify Environment Variables
- [ ] ทดสอบ API Key ด้วย curl โดยตรง
- [ ] เช็ค Browser Console สำหรับ error messages
- [ ] เช็ค Network tab สำหรับ HTTP status และ response
- [ ] เช็ค Netlify Function logs
- [ ] ลองทดสอบ local development
- [ ] Redeploy site
- [ ] รอ 2-3 นาทีหลัง redeploy แล้วทดสอบใหม่
- [ ] ลอง clear browser cache และ reload

---

## 📚 เอกสารเพิ่มเติม

- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - คู่มือแก้ไขปัญหาฉบับเต็ม
- **[LLM_PROVIDERS.md](./LLM_PROVIDERS.md)** - คู่มือการตั้งค่า LLM providers
- **[DEPLOY_NETLIFY.md](./DEPLOY_NETLIFY.md)** - คู่มือการ deploy บน Netlify

---

## 💡 Tips

1. **ใช้ Deepseek แทน OpenAI:** ประหยัดค่าใช้จ่ายได้มาก
2. **เปิด DEBUG_LLM=true:** เมื่อมีปัญหา
3. **ตรวจสอบ config-check endpoint เป็นประจำ**
4. **เก็บ logs ไว้:** จะช่วยในการ debug
5. **Test local development ก่อน deploy:** จะแก้ปัญหาได้เร็วกว่า

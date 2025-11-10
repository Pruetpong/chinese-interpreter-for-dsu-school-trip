# 🔧 คู่มือแก้ไขปัญหา Chatbot API Error

เอกสารนี้จัดทำขึ้นเพื่อช่วยแก้ไขปัญหา "ขออภัยค่ะ เกิดข้อผิดพลาดในการสื่อสาร" ที่เกิดขึ้นเมื่อพยายามส่งข้อความในแชทบอท

## 📋 สารบัญ
1. [สาเหตุที่พบบ่อย](#สาเหตุที่พบบ่อย)
2. [วิธีการตรวจสอบปัญหา](#วิธีการตรวจสอบปัญหา)
3. [วิธีแก้ไขแต่ละกรณี](#วิธีแก้ไขแต่ละกรณี)
4. [การทดสอบหลังแก้ไข](#การทดสอบหลังแก้ไข)

---

## 🔍 สาเหตุที่พบบ่อย

### 1. ❌ ไม่มีการตั้งค่า API_KEY Environment Variable
**อาการ:** แชทบอทตอบว่า "ขออภัยค่ะ เกิดข้อผิดพลาดในการสื่อสาร" ทันทีหลังส่งข้อความ

**สาเหตุ:**
- ไม่ได้ตั้งค่า `API_KEY` ใน Netlify Dashboard
- ตั้งชื่อ environment variable ผิด (เช่น `OPENAI_API_KEY` แทน `API_KEY`)

**วิธีตรวจสอบ:**
```bash
# เช็ค Netlify Function logs
netlify functions:log chat
```

หรือเข้าไปดูที่ Netlify Dashboard:
1. เข้า Site Settings > Environment Variables
2. ตรวจสอบว่ามี `API_KEY` หรือไม่

**วิธีแก้ไข:**
1. ไปที่ Netlify Dashboard
2. เลือก Site Settings > Environment Variables
3. เพิ่ม environment variables ดังนี้:

```
API_KEY=your-actual-api-key-here
LLM_PROVIDER=openai
```

หรือถ้าใช้ Deepseek:
```
API_KEY=your-deepseek-api-key-here
LLM_PROVIDER=deepseek
```

---

### 2. ❌ API Key ไม่ถูกต้องหรือหมดอายุ
**อาการ:** แชทบอทใช้เวลานานในการตอบกลับแล้วแสดง error

**วิธีตรวจสอบ:**
```bash
# ทดสอบ API key โดยตรง (OpenAI)
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

```bash
# ทดสอบ API key โดยตรง (Deepseek)
curl https://api.deepseek.com/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

**วิธีแก้ไข:**
- สร้าง API key ใหม่จากเว็บไซต์ของผู้ให้บริการ
- อัปเดต `API_KEY` ใน Netlify Environment Variables

---

### 3. ❌ LLM Provider Configuration ไม่ถูกต้อง
**อาการ:** Error เกิดขึ้นเฉพาะเมื่อใช้ provider บางตัว (Deepseek, OpenRouter, etc.)

**สาเหตุที่พบบ่อย:**
- ใช้ base URL ที่ไม่ถูกต้อง
- Model name สะกดผิด
- ไม่ได้ตั้งค่า required headers (สำหรับ OpenRouter)

**วิธีตรวจสอบ:**
```bash
# เช็ค environment variables ทั้งหมด
# ใน Netlify Dashboard > Site Settings > Environment Variables

# ตรวจสอบว่ามีค่าเหล่านี้:
LLM_PROVIDER=deepseek  # หรือ openai, openrouter, custom
API_KEY=sk-...
MODEL_NAME=deepseek-chat  # (optional)
```

**Config ที่ถูกต้องสำหรับแต่ละ provider:**

#### OpenAI (Default)
```
LLM_PROVIDER=openai
API_KEY=sk-proj-...
# MODEL_NAME=gpt-4o-mini  # optional
```

#### Deepseek
```
LLM_PROVIDER=deepseek
API_KEY=sk-...
# MODEL_NAME=deepseek-chat  # optional, ใช้ค่า default ได้
```

#### OpenRouter
```
LLM_PROVIDER=openrouter
API_KEY=sk-or-...
APP_URL=https://your-app-url.netlify.app
# MODEL_NAME=openai/gpt-4o-mini  # optional
```

#### Custom OpenAI-compatible API
```
LLM_PROVIDER=custom
API_KEY=your-api-key
CUSTOM_API_BASE_URL=https://your-api.example.com/v1
CUSTOM_MODEL_NAME=your-model-name
```

**วิธีแก้ไข:**
1. ตรวจสอบและแก้ไข environment variables ให้ถูกต้อง
2. Redeploy site (Netlify จะ restart functions อัตโนมัติ)

---

### 4. ❌ Network/CORS Issues
**อาการ:** Error แสดงว่า "Failed to fetch" หรือ "Network error"

**วิธีตรวจสอบ:**
1. เปิด Browser DevTools (F12)
2. ไปที่แท็บ Network
3. ส่งข้อความในแชท
4. ดูว่า request ไปที่ `/api/chat` สำเร็จหรือไม่

**สิ่งที่ต้องตรวจสอบ:**
- HTTP Status Code (ควรเป็น 200)
- CORS headers (ต้องมี `Access-Control-Allow-Origin`)
- Response body (ถ้าเป็น error จะมี error message)

**วิธีแก้ไข:**
- ตรวจสอบว่า Netlify Functions deploy สำเร็จ
- ตรวจสอบ `netlify.toml` ว่ามี redirect rule สำหรับ `/api/*`
- Redeploy site

---

### 5. ❌ Quota หมดหรือถูก Rate Limit
**อาการ:** Error เกิดขึ้นหลังจากใช้งานไปสักพัก

**วิธีตรวจสอบ:**
- เช็ค dashboard ของ API provider (OpenAI, Deepseek, etc.)
- ดู error message ใน Netlify Function logs

**วิธีแก้ไข:**
- เติมเงินใน API provider account
- เปลี่ยนไปใช้ provider อื่น
- รอจนกว่า rate limit จะรีเซ็ต

---

## 🔍 วิธีการตรวจสอบปัญหา

### ขั้นตอนที่ 1: เช็ค Browser Console
```
1. เปิด Browser DevTools (F12)
2. ไปที่แท็บ Console
3. ส่งข้อความในแชท
4. ดู error messages ที่แสดงขึ้น
```

ตัวอย่าง error ที่อาจเจอ:
```
Error in sendMessage: Error: HTTP error! status: 500
```

### ขั้นตอนที่ 2: เช็ค Network Tab
```
1. เปิด Browser DevTools (F12)
2. ไปที่แท็บ Network
3. Filter เฉพาะ "Fetch/XHR"
4. ส่งข้อความในแชท
5. คลิกที่ request "chat"
6. ดู Response tab
```

ตัวอย่าง response ที่อาจเจอ:
```json
{
  "error": "Server configuration error",
  "message": "API_KEY environment variable is not configured..."
}
```

### ขั้นตอนที่ 3: เช็ค Netlify Function Logs
```bash
# ติดตั้ง Netlify CLI ถ้ายังไม่มี
npm install -g netlify-cli

# Login
netlify login

# ดู logs
netlify functions:log chat
```

หรือดูผ่าน Netlify Dashboard:
```
1. ไปที่ Netlify Dashboard
2. เลือก Site
3. ไปที่ Functions tab
4. คลิกที่ "chat" function
5. ดู Recent logs
```

### ขั้นตอนที่ 4: ทดสอบ API โดยตรง
```bash
# ทดสอบ health check endpoint
curl https://your-site.netlify.app/api/health

# ทดสอบ chat endpoint
curl -X POST https://your-site.netlify.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "system", "content": "You are a helpful assistant"},
      {"role": "user", "content": "Hello"}
    ],
    "temperature": 0.7
  }'
```

---

## 🛠️ วิธีแก้ไขแต่ละกรณี

### กรณีที่ 1: ไม่มี API_KEY

**ขั้นตอนการแก้ไข:**
1. ไปที่ Netlify Dashboard
2. เลือก Site ของคุณ
3. ไปที่ **Site settings** > **Environment variables**
4. คลิก **Add a variable**
5. เพิ่มตัวแปรดังนี้:
   - Key: `API_KEY`
   - Value: `sk-your-actual-api-key` (API key จาก OpenAI, Deepseek, etc.)
   - Scopes: เลือก **All**
6. คลิก **Create variable**
7. **ไม่จำเป็นต้อง redeploy** - Netlify จะ restart functions อัตโนมัติ
8. รอประมาณ 1-2 นาที แล้วทดสอบใหม่

---

### กรณีที่ 2: ต้องการใช้ Deepseek แทน OpenAI

**ขั้นตอนการแก้ไข:**
1. สมัครและสร้าง API key ที่ https://platform.deepseek.com
2. ไปที่ Netlify Dashboard > Site settings > Environment variables
3. เพิ่ม/แก้ไขตัวแปรดังนี้:
   ```
   LLM_PROVIDER=deepseek
   API_KEY=sk-your-deepseek-api-key
   ```
4. (Optional) ถ้าต้องการใช้ TTS/Whisper ให้เพิ่ม OpenAI key สำหรับ fallback:
   ```
   OPENAI_API_KEY=sk-your-openai-api-key
   ```
5. รอประมาณ 1-2 นาที แล้วทดสอบใหม่

---

### กรณีที่ 3: Debug Mode - ดู Provider Info ใน Logs

**ขั้นตอนการเปิด debug mode:**
1. ไปที่ Netlify Dashboard > Site settings > Environment variables
2. เพิ่มตัวแปร:
   ```
   DEBUG_LLM=true
   ```
3. ดู logs ผ่าน Netlify Dashboard หรือใช้ `netlify functions:log chat`
4. จะเห็น log ประมาณนี้:
   ```
   [LLM Config] Using provider: Deepseek
   [LLM Config] Base URL: https://api.deepseek.com
   [LLM Config] Model: deepseek-chat
   [LLM Config] TTS Support: false
   [LLM Config] Whisper Support: false
   ```

---

### กรณีที่ 4: ทดสอบ Local Development

**ขั้นตอน:**
1. สร้างไฟล์ `.env.local` ในโปรเจค:
   ```bash
   cp .env.local.example .env.local
   ```

2. แก้ไขไฟล์ `.env.local`:
   ```env
   # LLM Provider Configuration
   LLM_PROVIDER=openai
   API_KEY=sk-your-api-key-here

   # Backend server port
   PORT=3001

   # Frontend Vite API URL
   VITE_API_URL=http://localhost:8888
   ```

3. รัน development server:
   ```bash
   # ใช้ Netlify Dev (แนะนำ)
   npm run dev:netlify

   # หรือใช้ Express server
   npm run dev
   ```

4. ทดสอบที่ http://localhost:8888

---

## ✅ การทดสอบหลังแก้ไข

### 1. ทดสอบ Health Check
```bash
curl https://your-site.netlify.app/api/health
```

ควรได้ response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. ทดสอบ Chat API
```bash
curl -X POST https://your-site.netlify.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "system", "content": "You are a helpful assistant"},
      {"role": "user", "content": "สวัสดี"}
    ]
  }'
```

ควรได้ response ที่มี `content`:
```json
{
  "content": "สวัสดีครับ! มีอะไรให้ผมช่วยไหมครับ"
}
```

### 3. ทดสอบผ่าน Web UI
1. เปิด website ของคุณ
2. เลือก Interpreter, Scenario, และ User Mode
3. ไปที่แท็บ "พูดภาษาไทย"
4. พิมพ์ข้อความ เช่น "สวัสดี"
5. กด Send

ควรได้การตอบกลับเป็นภาษาจีนพร้อมคำแปลภาษาไทย

---

## 📞 ติดต่อขอความช่วยเหลือ

หากยังพบปัญหาหลังจากทำตามคู่มือนี้แล้ว:

1. **Collect logs:**
   ```bash
   netlify functions:log chat
   ```

2. **เช็ค Browser Console logs** (F12 > Console tab)

3. **เช็ค Network tab** ใน DevTools

4. **Report issue พร้อมข้อมูลเหล่านี้:**
   - Error message ที่เห็นใน Browser Console
   - Response จาก Network tab
   - Netlify Function logs
   - Environment variables ที่ตั้งไว้ (ห้ามส่ง API key จริง!)

---

## 🔄 Checklist สำหรับการแก้ปัญหา

- [ ] ตรวจสอบว่ามี `API_KEY` ใน Netlify Environment Variables
- [ ] ตรวจสอบว่า API key ถูกต้องและยังใช้งานได้
- [ ] ตรวจสอบว่า `LLM_PROVIDER` ตั้งค่าถูกต้อง
- [ ] ทดสอบ API โดยตรงด้วย curl
- [ ] เช็ค Browser Console สำหรับ error messages
- [ ] เช็ค Network tab สำหรับ HTTP status และ response
- [ ] เช็ค Netlify Function logs
- [ ] ลองทดสอบ local development ก่อน
- [ ] Redeploy site หลังแก้ไข environment variables
- [ ] รอ 1-2 นาทีหลัง redeploy แล้วทดสอบใหม่

---

## 📚 เอกสารอ้างอิง

- [LLM_PROVIDERS.md](./LLM_PROVIDERS.md) - คู่มือการตั้งค่า LLM providers
- [DEPLOY_NETLIFY.md](./DEPLOY_NETLIFY.md) - คู่มือการ deploy บน Netlify
- [Netlify Environment Variables Docs](https://docs.netlify.com/environment-variables/overview/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Deepseek API Documentation](https://platform.deepseek.com/api-docs)

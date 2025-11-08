<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Chinese Interpreter for DSU School Trip 🏮

แอปพลิเคชันล่ามภาษาจีนที่ใช้ AI สำหรับการเดินทางท่องเที่ยวเฉิงตู โดยใช้ OpenAI API (GPT-4o-mini)

## ✨ Features

- 🗣️ **3 โหมดการใช้งาน:**
  - **ใช้งานล่าม**: แปลจากไทย/อังกฤษเป็นภาษาจีน
  - **เข้าใจคนจีน**: แปลจีนเป็นไทย พร้อมคำแนะนำการตอบกลับ
  - **ปรึกษาล่าม**: คำแนะนำด้านวัฒนธรรมและมารยาทจีน

- 🎭 **6 ประเภทล่าม**: General, Academic, Tourism, Emergency, Business, Navigation
- 🎯 **8 สถานการณ์**: Airport, Hotel, Educational Visit, Restaurant, Tourism, Shopping, Transportation, Emergency
- 🔊 **Text-to-Speech**: ฟังการออกเสียงภาษาจีน
- 🎤 **Speech-to-Text**: พูดแทนการพิมพ์
- 💾 **Save/Load**: บันทึกและโหลดการสนทนา

## 🚀 Run Locally

### Prerequisites
- Node.js (v18 or higher)
- OpenAI API Key ([Get it here](https://platform.openai.com/api-keys))

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd chinese-interpreter-for-dsu-school-trip
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` and add your OpenAI API key:
   ```
   API_KEY=sk-your-openai-api-key-here
   ```

4. **Run the app:**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend Proxy Server: `http://localhost:3001`
   - Frontend Vite Dev Server: `http://localhost:5173`

5. **Open your browser:**
   Navigate to `http://localhost:5173`

## 🏗️ Architecture

```
Frontend (React + Vite)
    ↓ HTTP Requests
Backend Proxy (Express)
    ↓ API Calls
OpenAI API
```

### Why Backend Proxy?

เราใช้ Backend Proxy เพื่อ:
- 🔒 ป้องกัน API Key ไม่ให้โผล่บน client-side
- 🛡️ เพิ่มความปลอดภัย
- 📊 ควบคุม rate limiting และ logging

## 📁 Project Structure

```
├── server/
│   └── index.js              # Backend Proxy (Express)
├── services/
│   └── openaiService.ts      # OpenAI API integration
├── components/
│   ├── MessageBubble.tsx     # Chat UI component
│   └── icons.tsx             # SVG icons
├── App.tsx                   # Main application
├── constants.ts              # Configuration data
├── types.ts                  # TypeScript types
└── package.json
```

## 🔧 Technologies Used

- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite
- **Backend**: Express.js, Node.js
- **AI**: OpenAI API (GPT-4o-mini, TTS-1, Whisper-1)
- **Audio**: Web Audio API

## 📝 API Endpoints

Backend Proxy provides:
- `POST /api/chat` - Chat completions (streaming)
- `POST /api/tts` - Text-to-Speech
- `POST /api/transcribe` - Speech-to-Text

## 💰 Cost Estimation

OpenAI API pricing (as of 2024):
- GPT-4o-mini: ~$0.15/1M input tokens, ~$0.60/1M output tokens
- TTS-1: ~$15/1M characters
- Whisper-1: ~$0.006/minute

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

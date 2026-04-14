# 🤖 LogicAI — Logic-based AI Chatbot

Pure rule/pattern-based AI. No external API calls. Runs on Node.js. Deploy free on Render.

---

## 📁 Project Structure

```
logic-ai/
├── server.js              ← Express backend + API routes
├── logic/
│   └── ai-engine.js       ← Core AI logic (rules, patterns, knowledge)
├── public/
│   └── index.html         ← Claude-like frontend UI
├── package.json
├── render.yaml            ← Render deployment config
└── .gitignore
```

---

## 🚀 Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Start server
npm start
# or for development
npm run dev

# 3. Open browser
# http://localhost:3000
```

---

## ☁️ Render Deployment

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USER/logic-ai.git
git push -u origin main
```

### Step 2: Deploy on Render
1. Go to [render.com](https://render.com) → New → Web Service
2. Connect your GitHub repo
3. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Environment:** Node
4. Click **Deploy** ✅

Your app will be live at: `https://logic-ai.onrender.com`

---

## 📡 API Usage

### Chat (text)
```bash
POST /api/chat
Content-Type: application/json

{
  "message": "Hello!",
  "session_id": "user123"   # optional, for conversation memory
}
```

### Chat with file
```bash
POST /api/chat/upload
Content-Type: multipart/form-data

Fields:
  message    = "Analyze this"
  session_id = "user123"
  file       = <any file>
```

### Get history
```bash
GET /api/history/user123
```

### Clear session
```bash
DELETE /api/session/user123
```

### Health check
```bash
GET /api/health
```

---

## 🧠 Adding New Knowledge

Edit `logic/ai-engine.js` → `KNOWLEDGE` array:

```javascript
{
  keys: ["your keyword", "another keyword"],
  ans: "Your response here with **markdown** support."
}
```

## 💻 Adding New Code Patterns

Edit `CODE_PATTERNS` object in `logic/ai-engine.js`:

```javascript
"your pattern here": `\`\`\`python
# your code
\`\`\``
```

---

## 📦 Supported File Types

| Type       | Support           |
|------------|-------------------|
| `.txt`     | ✅ Full text read  |
| `.md`      | ✅ Full text read  |
| `.json`    | ✅ Full text read  |
| `.csv`     | ✅ Full text read  |
| `.js/.py`  | ✅ Full text read  |
| `.pdf`     | ✅ Text extract    |
| `.docx`    | ✅ Text extract    |
| Images     | ✅ Uploaded (no vision)|
| Any other  | ✅ Metadata shown  |

---

Built with ❤️ using Node.js + Express

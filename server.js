const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { processMessage, clearSession, getHistory } = require("./logic/ai-engine");

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static(path.join(__dirname, "public")));

// ─── Multer (file upload) ──────────────────────────────────────────────────────
const storage = multer.memoryStorage(); // store in memory for processing
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

// ─── File text extraction ──────────────────────────────────────────────────────
async function extractTextFromFile(buffer, mimetype, originalname) {
  try {
    const ext = path.extname(originalname).toLowerCase();

    // Plain text files
    if (
      mimetype === "text/plain" ||
      ext === ".txt" ||
      ext === ".md" ||
      ext === ".csv" ||
      ext === ".json" ||
      ext === ".xml" ||
      ext === ".html" ||
      ext === ".js" ||
      ext === ".py" ||
      ext === ".css"
    ) {
      return buffer.toString("utf-8").substring(0, 5000);
    }

    // PDF
    if (mimetype === "application/pdf" || ext === ".pdf") {
      try {
        const pdfParse = require("pdf-parse");
        const data = await pdfParse(buffer);
        return data.text.substring(0, 5000);
      } catch (e) {
        return null;
      }
    }

    // Word document
    if (
      mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      ext === ".docx"
    ) {
      try {
        const mammoth = require("mammoth");
        const result = await mammoth.extractRawText({ buffer });
        return result.value.substring(0, 5000);
      } catch (e) {
        return null;
      }
    }

    return null;
  } catch (err) {
    return null;
  }
}

// ─── API: Chat (text only) ─────────────────────────────────────────────────────
/**
 * POST /api/chat
 * Body: { message: string, session_id?: string }
 * Response: { response: string, session_id: string, timestamp: string }
 */
app.post("/api/chat", (req, res) => {
  try {
    const { message, session_id } = req.body;

    if (!message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({ error: "message field is required" });
    }

    const sessionId = session_id || uuidv4();
    const result = processMessage(message.trim(), sessionId);

    res.json({
      response: result.response,
      session_id: sessionId,
      timestamp: result.timestamp,
    });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── API: Chat with file ───────────────────────────────────────────────────────
/**
 * POST /api/chat/upload
 * Form-data: { message?: string, session_id?: string, file: File }
 * Response: { response: string, session_id: string, timestamp: string }
 */
app.post("/api/chat/upload", upload.single("file"), async (req, res) => {
  try {
    const message = req.body.message || "";
    const sessionId = req.body.session_id || uuidv4();

    let fileInfo = null;
    if (req.file) {
      const extractedText = await extractTextFromFile(
        req.file.buffer,
        req.file.mimetype,
        req.file.originalname
      );

      fileInfo = {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        extractedText,
      };
    }

    const userMessage = message.trim() || (fileInfo ? "এই ফাইলটি analyze করো।" : "");

    if (!userMessage && !fileInfo) {
      return res.status(400).json({ error: "message or file is required" });
    }

    const result = processMessage(userMessage, sessionId, fileInfo);

    res.json({
      response: result.response,
      session_id: sessionId,
      timestamp: result.timestamp,
      file_received: !!req.file,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── API: Get history ──────────────────────────────────────────────────────────
/**
 * GET /api/history/:session_id
 */
app.get("/api/history/:session_id", (req, res) => {
  const history = getHistory(req.params.session_id);
  res.json({ session_id: req.params.session_id, history });
});

// ─── API: Clear session ────────────────────────────────────────────────────────
/**
 * DELETE /api/session/:session_id
 */
app.delete("/api/session/:session_id", (req, res) => {
  clearSession(req.params.session_id);
  res.json({ message: "Session cleared", session_id: req.params.session_id });
});

// ─── API: Health check ─────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "LogicAI is running", uptime: process.uptime() });
});

// ─── API: Docs ─────────────────────────────────────────────────────────────────
app.get("/api", (req, res) => {
  res.json({
    name: "LogicAI API",
    version: "1.0.0",
    endpoints: {
      "POST /api/chat": "Text chat — body: { message, session_id? }",
      "POST /api/chat/upload": "Chat with file — multipart/form-data: { message?, session_id?, file }",
      "GET /api/history/:session_id": "Get conversation history",
      "DELETE /api/session/:session_id": "Clear session",
      "GET /api/health": "Health check",
    },
  });
});

// ─── Catch-all → Frontend ──────────────────────────────────────────────────────
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ─── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🤖 LogicAI Server running on http://localhost:${PORT}`);
  console.log(`📡 API docs: http://localhost:${PORT}/api\n`);
});

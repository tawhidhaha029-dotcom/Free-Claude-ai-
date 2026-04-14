/**
 * =============================================
 *   LOGIC-BASED AI ENGINE
 *   No external API — pure pattern & rule logic
 * =============================================
 */

const conversationMemory = new Map(); // sessionId -> [{role, content}]

// ─── Utility ──────────────────────────────────────────────────────────────────
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const includes = (text, keywords) =>
  keywords.some((k) => text.toLowerCase().includes(k.toLowerCase()));

// ─── Personality & Identity ────────────────────────────────────────────────────
const IDENTITY = {
  name: "LogicAI",
  creator: "তোমার developer",
  description: "আমি একটি logic-based AI। আমি pattern, rule এবং knowledge দিয়ে কাজ করি।",
};

// ─── Greeting Responses ────────────────────────────────────────────────────────
const GREETINGS = {
  patterns: ["hello", "hi", "hey", "হ্যালো", "হেই", "হাই", "আস্সালামু আলাইকুম", "সালাম", "কেমন আছ", "কেমন আছো", "কি খবর"],
  responses: [
    `হ্যালো! আমি ${IDENTITY.name}। আপনাকে কীভাবে সাহায্য করতে পারি?`,
    `হাই! কী করতে পারি আপনার জন্য?`,
    `আস্সালামু আলাইকুম! কীভাবে সাহায্য করতে পারি?`,
    `হ্যালো! আপনার সাথে কথা বলে ভালো লাগছে। কী জানতে চান?`,
  ],
};

// ─── Identity Questions ────────────────────────────────────────────────────────
const IDENTITY_PATTERNS = {
  patterns: ["তুমি কে", "তুমি কি", "আপনি কে", "your name", "তোমার নাম", "who are you", "what are you", "কে বানিয়েছে", "who made you", "who created you"],
  responses: [
    `আমি **${IDENTITY.name}** — একটি logic-based AI assistant। আমি বিভিন্ন প্রশ্নের উত্তর দিতে, code লিখতে, গণিত করতে, এবং তথ্য দিতে পারি। আমাকে বানিয়েছেন ${IDENTITY.creator}।`,
    `আমার নাম **${IDENTITY.name}**। আমি pattern ও rule-based logic ব্যবহার করে কাজ করি। কোনো বড় server বা external AI model ব্যবহার করি না।`,
  ],
};

// ─── Thanks ────────────────────────────────────────────────────────────────────
const THANKS = {
  patterns: ["ধন্যবাদ", "thanks", "thank you", "tnx", "thx", "অনেক ধন্যবাদ"],
  responses: [
    "আপনাকে স্বাগতম! আর কিছু জানতে চাইলে জিজ্ঞেস করুন। 😊",
    "ধন্যবাদ আপনাকেও! কোনো প্রশ্ন থাকলে বলুন।",
    "আপনার সেবায় সদা প্রস্তুত! 🙏",
  ],
};

// ─── Farewells ─────────────────────────────────────────────────────────────────
const FAREWELLS = {
  patterns: ["bye", "বাই", "goodbye", "আল্লাহ হাফেজ", "খোদা হাফেজ", "see you", "later"],
  responses: [
    "বাই! ভালো থাকুন। আবার আসবেন। 😊",
    "আল্লাহ হাফেজ! পরে দেখা হবে।",
    "Take care! দরকার হলে আবার আসবেন।",
  ],
};

// ─── Math Engine ───────────────────────────────────────────────────────────────
function tryMath(text) {
  // Clean the input
  const cleaned = text
    .replace(/[×x]/gi, "*")
    .replace(/[÷]/g, "/")
    .replace(/[^0-9+\-*/().\s%^]/g, "")
    .trim();

  if (!cleaned || cleaned.length < 1) return null;

  try {
    // Only evaluate if it looks like a math expression
    if (!/[+\-*/%^()]/.test(cleaned) && !/^\d+$/.test(cleaned)) return null;

    // Safe eval using Function
    const result = Function('"use strict"; return (' + cleaned + ")")();
    if (typeof result === "number" && !isNaN(result) && isFinite(result)) {
      return `**ফলাফল:** \`${cleaned} = ${result}\``;
    }
  } catch (e) {
    return null;
  }
  return null;
}

// ─── Code Generation ───────────────────────────────────────────────────────────
const CODE_PATTERNS = {
  "hello world python": `\`\`\`python
print("Hello, World!")
\`\`\``,
  "hello world javascript": `\`\`\`javascript
console.log("Hello, World!");
\`\`\``,
  "hello world java": `\`\`\`java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
\`\`\``,
  "hello world c": `\`\`\`c
#include <stdio.h>
int main() {
    printf("Hello, World!\\n");
    return 0;
}
\`\`\``,
  "fibonacci python": `\`\`\`python
def fibonacci(n):
    a, b = 0, 1
    result = []
    for _ in range(n):
        result.append(a)
        a, b = b, a + b
    return result

print(fibonacci(10))
# Output: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
\`\`\``,
  "factorial python": `\`\`\`python
def factorial(n):
    if n == 0 or n == 1:
        return 1
    return n * factorial(n - 1)

print(factorial(5))  # Output: 120
\`\`\``,
  "reverse string python": `\`\`\`python
def reverse_string(s):
    return s[::-1]

print(reverse_string("Hello"))  # Output: olleH
\`\`\``,
  "sum array javascript": `\`\`\`javascript
const arr = [1, 2, 3, 4, 5];
const sum = arr.reduce((acc, val) => acc + val, 0);
console.log(sum); // Output: 15
\`\`\``,
  "express server": `\`\`\`javascript
const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Hello from Express!' });
});

app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
});
\`\`\``,
  "flask server": `\`\`\`python
from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/')
def home():
    return jsonify({"message": "Hello from Flask!"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
\`\`\``,
  "bubble sort": `\`\`\`python
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

print(bubble_sort([64, 34, 25, 12, 22, 11, 90]))
\`\`\``,
  "binary search": `\`\`\`python
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

arr = [2, 3, 4, 10, 40]
print(binary_search(arr, 10))  # Output: 3
\`\`\``,
};

function tryCode(text) {
  const lower = text.toLowerCase();
  for (const [pattern, code] of Object.entries(CODE_PATTERNS)) {
    const words = pattern.split(" ");
    if (words.every((w) => lower.includes(w))) {
      return `এই code টা দেখো:\n\n${code}`;
    }
  }
  return null;
}

// ─── Knowledge Base ────────────────────────────────────────────────────────────
const KNOWLEDGE = [
  {
    keys: ["বাংলাদেশের রাজধানী", "bangladesh capital", "ঢাকা রাজধানী"],
    ans: "বাংলাদেশের রাজধানী **ঢাকা**। এটি দেশের বৃহত্তম শহর এবং অর্থনৈতিক কেন্দ্র।",
  },
  {
    keys: ["বাংলাদেশ স্বাধীন", "bangladesh independence", "মুক্তিযুদ্ধ"],
    ans: "বাংলাদেশ **১৯৭১ সালের ১৬ই ডিসেম্বর** স্বাধীন হয়। দীর্ঘ নয় মাস মুক্তিযুদ্ধের পর পাকিস্তানি বাহিনী আত্মসমর্পণ করে।",
  },
  {
    keys: ["পৃথিবীর বৃহত্তম দেশ", "largest country"],
    ans: "পৃথিবীর বৃহত্তম দেশ (আয়তনে) হলো **রাশিয়া** — প্রায় ১৭.১ মিলিয়ন বর্গকিলোমিটার।",
  },
  {
    keys: ["পৃথিবীর জনসংখ্যা", "world population"],
    ans: "বর্তমানে পৃথিবীর জনসংখ্যা প্রায় **৮ বিলিয়নের বেশি**।",
  },
  {
    keys: ["সূর্য থেকে পৃথিবী", "earth sun distance"],
    ans: "পৃথিবী থেকে সূর্যের দূরত্ব গড়ে প্রায় **১৫ কোটি কিলোমিটার** (১ Astronomical Unit)।",
  },
  {
    keys: ["আলোর গতি", "speed of light"],
    ans: "আলোর গতি শূন্যে প্রতি সেকেন্ডে প্রায় **২৯৯,৭৯২,৪৫৮ মিটার** (প্রায় ৩×১০⁸ m/s)।",
  },
  {
    keys: ["python কী", "python কি", "what is python"],
    ans: "**Python** একটি উচ্চ-স্তরের, সাধারণ-উদ্দেশ্যের programming language। এটি সহজ syntax, readable code এবং বিশাল library ecosystem এর জন্য বিখ্যাত। Data science, web development, automation, AI/ML সব ক্ষেত্রে ব্যবহৃত হয়।",
  },
  {
    keys: ["javascript কী", "javascript কি", "what is javascript"],
    ans: "**JavaScript** একটি scripting language যা primarily web browsers এ চলে। Frontend interaction, DOM manipulation ছাড়াও Node.js দিয়ে backend এও ব্যবহার হয়। এটি web এর সবচেয়ে জনপ্রিয় language।",
  },
  {
    keys: ["html কী", "html কি", "what is html"],
    ans: "**HTML (HyperText Markup Language)** হলো web page এর structure তৈরির language। এটি tags দিয়ে content define করে। CSS style দেয়, JavaScript interactivity দেয়।",
  },
  {
    keys: ["css কী", "css কি", "what is css"],
    ans: "**CSS (Cascading Style Sheets)** হলো web page এর styling language। HTML elements এর color, font, layout, animation সব CSS দিয়ে control করা হয়।",
  },
  {
    keys: ["api কী", "api কি", "what is api"],
    ans: "**API (Application Programming Interface)** হলো দুটি software এর মধ্যে communication এর একটি interface। এটি define করে কীভাবে একটি application অন্যটির সাথে data আদান-প্রদান করবে। REST, GraphQL, WebSocket বিভিন্ন ধরনের API আছে।",
  },
  {
    keys: ["database কী", "database কি", "what is database"],
    ans: "**Database** হলো organized data এর একটি collection যা সহজে access, manage ও update করা যায়। দুই ধরনের database আছে:\n- **SQL** (Relational): MySQL, PostgreSQL, SQLite\n- **NoSQL** (Non-relational): MongoDB, Redis, Cassandra",
  },
  {
    keys: ["artificial intelligence", "ai কী", "ai কি", "কৃত্রিম বুদ্ধিমত্তা"],
    ans: "**Artificial Intelligence (AI)** বা কৃত্রিম বুদ্ধিমত্তা হলো computer science এর একটি শাখা যেখানে machines কে human-like intelligence দেওয়া হয়। Machine Learning, Deep Learning, Natural Language Processing (NLP) এর মাধ্যমে AI কাজ করে।",
  },
  {
    keys: ["machine learning", "ml কী", "ml কি"],
    ans: "**Machine Learning** হলো AI এর একটি subset। এখানে algorithms data থেকে শিখে নিজে সিদ্ধান্ত নেয়, explicitly programmed না হয়ে। Supervised, Unsupervised, Reinforcement Learning — এই তিন ধরনের ML আছে।",
  },
  {
    keys: ["ওজন কমানো", "weight loss", "ডায়েট"],
    ans: "স্বাস্থ্যকরভাবে ওজন কমাতে:\n- **Caloric deficit** মেনটেন করুন (খরচের চেয়ে কম খান)\n- প্রতিদিন **30-60 মিনিট** exercise করুন\n- **Protein** বেশি খান, processed food এড়িয়ে চলুন\n- পর্যাপ্ত **ঘুম** নিন (7-8 ঘন্টা)\n- প্রচুর **পানি** পান করুন\n\n*কোনো dramatic diet না করে lifestyle change করুন।*",
  },
  {
    keys: ["রেসিপি", "রান্না", "recipe", "cooking"],
    ans: "কোন খাবারের রেসিপি জানতে চান? আমাকে specific করে বলুন — যেমন \"ভাত রান্নার রেসিপি\", \"chicken curry recipe\", \"chocolate cake recipe\" ইত্যাদি।",
  },
];

function searchKnowledge(text) {
  const lower = text.toLowerCase();
  for (const item of KNOWLEDGE) {
    if (item.keys.some((k) => lower.includes(k.toLowerCase()))) {
      return item.ans;
    }
  }
  return null;
}

// ─── Math word problems ────────────────────────────────────────────────────────
const MATH_WORDS = {
  patterns: ["যোগ", "বিয়োগ", "গুণ", "ভাগ", "calculate", "গণনা", "হিসাব", "কত হয়", "কত হবে", "result", "ফলাফল"],
};

// ─── Capability Responses ──────────────────────────────────────────────────────
const CAPABILITIES = {
  patterns: ["তুমি কী করতে পার", "তুমি কি করতে পার", "what can you do", "তোমার capability", "help", "সাহায্য কর"],
  response: `আমি যা করতে পারি:

**📚 তথ্য ও জ্ঞান**
- সাধারণ জ্ঞান প্রশ্নের উত্তর
- বিজ্ঞান, প্রযুক্তি, ইতিহাস বিষয়ক তথ্য

**💻 Programming & Code**
- Python, JavaScript, Java, C code লিখতে পারি
- Algorithm explain করতে পারি

**🔢 গণিত**
- Basic থেকে complex calculation
- Expression evaluate করা

**💬 সাধারণ কথোপকথন**
- বাংলা ও ইংরেজিতে কথা বলতে পারি

**📁 ফাইল বিশ্লেষণ**
- Image, PDF, text file upload করে জিজ্ঞেস করতে পারেন

*কিছু জানতে চাইলে সরাসরি জিজ্ঞেস করুন!*`,
};

// ─── Language detection ────────────────────────────────────────────────────────
function isBangla(text) {
  return /[\u0980-\u09FF]/.test(text);
}

// ─── Fallback responses ────────────────────────────────────────────────────────
const FALLBACKS_BN = [
  "আপনার প্রশ্নটি সম্পর্কে আমার কাছে সুনির্দিষ্ট তথ্য নেই। তবে আরো specific করে বললে চেষ্টা করব।",
  "এই বিষয়ে আমার database এ তথ্য নেই। অন্য কিছু জানতে চাইলে বলুন।",
  "আমি এই প্রশ্নের উত্তর এই মুহূর্তে দিতে পারছি না। একটু ভিন্নভাবে জিজ্ঞেস করুন।",
  "এটি আমার জ্ঞানের বাইরে। তবে আপনি যদি topic change করেন, সাহায্য করতে পারব।",
];

const FALLBACKS_EN = [
  "I don't have specific information about that. Could you elaborate or ask differently?",
  "That's outside my current knowledge base. Try asking in a different way!",
  "I'm not sure about that one. Let me know if you have another question!",
];

// ─── File Analysis ─────────────────────────────────────────────────────────────
function analyzeFile(fileInfo) {
  const { mimetype, originalname, size, extractedText } = fileInfo;
  const sizeKB = (size / 1024).toFixed(1);

  if (extractedText && extractedText.trim().length > 0) {
    const wordCount = extractedText.trim().split(/\s+/).length;
    const preview = extractedText.substring(0, 300);
    return `**ফাইল বিশ্লেষণ: \`${originalname}\`**\n\n📄 **আকার:** ${sizeKB} KB\n📝 **শব্দ সংখ্যা:** প্রায় ${wordCount} টি\n\n**Content Preview:**\n\`\`\`\n${preview}${extractedText.length > 300 ? "..." : ""}\n\`\`\`\n\nফাইলটি সফলভাবে পড়া হয়েছে। এই content সম্পর্কে কিছু জিজ্ঞেস করুন।`;
  }

  if (mimetype && mimetype.startsWith("image/")) {
    return `**ছবি পেয়েছি: \`${originalname}\`**\n\n🖼️ **ধরন:** ${mimetype}\n📦 **আকার:** ${sizeKB} KB\n\nছবিটি সফলভাবে upload হয়েছে। আমি pure logic-based AI হওয়ায় ছবির content analyze করতে পারি না — তবে ছবি সম্পর্কে আপনি বর্ণনা দিলে সাহায্য করতে পারব।`;
  }

  return `**ফাইল পেয়েছি: \`${originalname}\`**\n\n📁 **ধরন:** ${mimetype || "Unknown"}\n📦 **আকার:** ${sizeKB} KB\n\nফাইলটি upload হয়েছে। এটি সম্পর্কে কিছু জানতে চাইলে বলুন।`;
}

// ─── Context-aware response ────────────────────────────────────────────────────
function getContextualResponse(history, currentText) {
  if (history.length >= 2) {
    const lastAssistant = [...history].reverse().find((m) => m.role === "assistant");
    if (lastAssistant) {
      if (
        includes(currentText, ["হ্যাঁ", "yes", "okay", "ঠিক আছে", "আচ্ছা", "ok"]) &&
        lastAssistant.content.includes("জিজ্ঞেস করুন")
      ) {
        return "ঠিক আছে, বলুন — কী জানতে চান?";
      }
    }
  }
  return null;
}

// ─── MAIN ENGINE ───────────────────────────────────────────────────────────────
function processMessage(text, sessionId = "default", fileInfo = null) {
  // Init session
  if (!conversationMemory.has(sessionId)) {
    conversationMemory.set(sessionId, []);
  }
  const history = conversationMemory.get(sessionId);

  // Store user message
  history.push({ role: "user", content: text });

  let response = null;

  // 1. File analysis (if file attached)
  if (fileInfo) {
    response = analyzeFile(fileInfo);
  }

  // 2. Math calculation (direct expression)
  if (!response) {
    const mathResult = tryMath(text);
    if (mathResult) response = mathResult;
  }

  // 3. Greetings
  if (!response && includes(text, GREETINGS.patterns)) {
    response = rand(GREETINGS.responses);
  }

  // 4. Identity
  if (!response && includes(text, IDENTITY_PATTERNS.patterns)) {
    response = rand(IDENTITY_PATTERNS.responses);
  }

  // 5. Capabilities
  if (!response && includes(text, CAPABILITIES.patterns)) {
    response = CAPABILITIES.response;
  }

  // 6. Thanks
  if (!response && includes(text, THANKS.patterns)) {
    response = rand(THANKS.responses);
  }

  // 7. Farewells
  if (!response && includes(text, FAREWELLS.patterns)) {
    response = rand(FAREWELLS.responses);
  }

  // 8. Code generation
  if (!response) {
    const codeResult = tryCode(text);
    if (codeResult) response = codeResult;
  }

  // 9. Knowledge base
  if (!response) {
    const knowledgeResult = searchKnowledge(text);
    if (knowledgeResult) response = knowledgeResult;
  }

  // 10. Context-aware response
  if (!response) {
    const contextual = getContextualResponse(history, text);
    if (contextual) response = contextual;
  }

  // 11. Fallback
  if (!response) {
    response = isBangla(text) ? rand(FALLBACKS_BN) : rand(FALLBACKS_EN);
  }

  // Store assistant response
  history.push({ role: "assistant", content: response });

  // Trim memory (keep last 20 exchanges = 40 messages)
  if (history.length > 40) {
    conversationMemory.set(sessionId, history.slice(-40));
  }

  return {
    response,
    sessionId,
    timestamp: new Date().toISOString(),
  };
}

function clearSession(sessionId) {
  conversationMemory.delete(sessionId);
}

function getHistory(sessionId) {
  return conversationMemory.get(sessionId) || [];
}

module.exports = { processMessage, clearSession, getHistory };

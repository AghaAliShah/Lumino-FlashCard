import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent set for telemetry
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini API initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize Gemini API:", error);
  }
} else {
  console.log("Gemini API Key is not set or placeholder. Running with smart fallback generator.");
}

// Smart local fallback flashcards generator
function generateFallbackCards(topic: string): { front: string; back: string }[] {
  const normalized = topic.toLowerCase().trim();
  if (normalized.includes("javascript") || normalized.includes("js")) {
    return [
      { front: "What is a Closure in JavaScript?", back: "A closure is the combination of a function bundled together (enclosed) with references to its surrounding state (the lexical environment)." },
      { front: "Explain the difference between Synchronous and Asynchronous programming.", back: "Synchronous programming executes operations sequentially (blocking), while asynchronous programming allows operations to start and run in the background (non-blocking) using Promises, callbacks, or async/await." },
      { front: "What is Event Delegation in JavaScript?", back: "A design pattern where a single event listener is attached to a parent element to manage events for all of its current or future child elements using event bubbling." },
      { front: "What are Promises and what states can they be in?", back: "An object representing the eventual completion or failure of an asynchronous operation. States: Pending (initial state), Fulfilled (completed successfully), or Rejected (failed)." },
      { front: "What is the 'this' keyword in JavaScript?", back: "A reference to the object that is executing the current function. Its value is determined dynamically by how the function is called (lexical arrow, method execution, constructor instantiation, or global)." },
      { front: "Explain ES6 Object and Array Destructuring.", back: "A convenient syntax that allows extracting values from arrays or properties from objects into distinct variables in a single compact declaration." }
    ];
  }
  if (normalized.includes("spanish") || normalized.includes("vocab")) {
    return [
      { front: "To learn (Spanish verb)", back: "Aprender" },
      { front: "Thank you very much (Spanish phrase)", back: "Muchas gracias" },
      { front: "Good morning (Spanish greeting)", back: "Buenos días" },
      { front: "Where is the bathroom? (Spanish question)", back: "¿Dónde está el baño?" },
      { front: "Please (Spanish word)", back: "Por favor" },
      { front: "To write (Spanish verb)", back: "Escribir" }
    ];
  }
  if (normalized.includes("react") || normalized.includes("hook")) {
    return [
      { front: "What is React's Virtual DOM?", back: "A lightweight programming concept where an ideal, or 'virtual', representation of a UI is kept in memory and synced with the 'real' DOM by a library such as ReactDOM (a process called reconciliation)." },
      { front: "What is the purpose of the useEffect hook?", back: "Allows you to perform side effects in functional components, such as data fetching, subscription setup, manual DOM manipulation, and setting up timers or cleanups." },
      { front: "Explain the rules of Hooks in React.", back: "1. Only call Hooks at the top level (not inside loops or conditional statements).\n2. Only call Hooks from React Function Components or Custom Hooks." },
      { front: "What is state in React, and how is it updated?", back: "An object that holds component-specific data that may change over time. It is updated using a state setter (e.g., from useState), which triggers a component re-render." },
      { front: "What is raising state up in React?", back: "The practice of moving shared state to the closest common ancestor of the components that need it, so they can exchange data by passing state down as props." }
    ];
  }
  if (normalized.includes("science") || normalized.includes("physics") || normalized.includes("chemistry")) {
    return [
      { front: "What is Photosynthesis?", back: "The process used by plants, algae and certain bacteria to harness energy from sunlight and turn it into chemical energy (glucose) by absorbing Water (H2O) and Carbon Dioxide (CO2)." },
      { front: "What are Newton's Three Laws of Motion?", back: "1. Inertia (an object remains at rest/uniform motion unless acted upon).\n2. F = ma (force equals mass times acceleration).\n3. Action & Reaction (for every action, there is an equal and opposite reaction)." },
      { front: "Define Ionic bonding vs Covalent bonding.", back: "Ionic bonding involves the complete transfer of electrons from one atom to another (creating ions), while covalent bonding involves sharing electron pairs between atoms." },
      { front: "What is Entropy?", back: "A thermodynamic quantity representing the unavailability of a system's thermal energy for conversion into mechanical work, often interpreted as the measure of disorder or randomness in a closed system." },
      { front: "What is the role of the Mitochondria?", back: "Often called the 'powerhouse of the cell', they are organelles responsible for producing the cell's energetic currency (ATP) via aerobic cellular respiration." }
    ];
  }

  // General elegant fallback cards based on any arbitrary topic
  const capitalizedTopic = topic.charAt(0).toUpperCase() + topic.slice(1);
  return [
    { front: `What is the core definition of ${capitalizedTopic}?`, back: `This refers to the fundamental concept, primary purpose, and essential framework that defines ${topic} in study and practice.` },
    { front: `What is a primary key principle or component of ${capitalizedTopic}?`, back: `A central element that underpins ${topic}, ensuring its successful operation, application, or logical structure.` },
    { front: `Name a common misunderstanding or pitfall regarding ${capitalizedTopic}.`, back: `Confusing its core purpose, misapplying its rules, or failing to recognize how it relates to adjacent concepts.` },
    { front: `Why is studying ${capitalizedTopic} important today?`, back: `It provides critical contextual knowledge, practical skills, and foundational principles key to problem-solving in this domain.` },
    { front: `What is a practical, real-world example of ${capitalizedTopic}?`, back: `An instance where ${topic} is directly applied to solve concrete challenges, automate tasks, or demonstrate an empirical concept.` }
  ];
}

// API endpoint to generate flashcards
app.post("/api/generate", async (req, res) => {
  const { topic } = req.body;

  if (!topic || typeof topic !== "string" || topic.trim() === "") {
    return res.status(400).json({ error: "Topic is required" });
  }

  // If Gemini client is ready, let's call it!
  if (ai) {
    try {
      console.log(`Generating flashcards via Gemini for topic: "${topic}"`);
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Generate a list of 6 highly informative and realistic study flashcards about the topic: "${topic}". Provide a mix of key concepts, definitions, and practical problems if applicable. Every card must have a clear "front" (question, term, or prompt) and a "back" (answer, definition, or explanation). Keep descriptions clear and reasonably concise.`,
        config: {
          systemInstruction: "You are an expert tutor designing premium study decks.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                front: { type: Type.STRING, description: "Question, word, or concept" },
                back: { type: Type.STRING, description: "Answer, definition, or detailed explanation" }
              },
              required: ["front", "back"]
            }
          }
        }
      });

      const text = response.text;
      if (text) {
        const cleanedText = text.trim();
        const flashcards = JSON.parse(cleanedText);
        console.log(`Successfully generated ${flashcards.length} cards using Gemini.`);
        return res.json({ flashcards, source: "ai" });
      }
    } catch (apiError) {
      console.error("Gemini API generation failed, falling back to smart mock offline generator:", apiError);
    }
  }

  // Fallback to smart local generator
  console.log(`Using fallback generator for topic: "${topic}"`);
  const cards = generateFallbackCards(topic);
  return res.json({ flashcards: cards, source: "local" });
});

// Setup Vite Dev server or production static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev server middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Running in Production. Static serving configured.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

import React, { useState, useEffect } from "react";
import { Sparkles, HelpCircle, AlertCircle, ArrowRight } from "lucide-react";
import { Flashcard } from "../types";

interface AIGeneratorProps {
  onCardsGenerated: (cards: Flashcard[], source: "ai" | "local", topic: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const SUGGESTIONS = [
  { label: "JS Array Methods", value: "JavaScript Array Methods" },
  { label: "Spanish Basics", value: "Spanish Vocabulary" },
  { label: "React Hooks", value: "React Hooks" },
  { label: "Physics Laws", value: "Newton laws of physics" },
];

const LOADING_STEPS = [
  "Consulting the digital tutor...",
  "Formatting study questions...",
  "Structuring deep-dive explanations...",
  "Assembling your custom card deck...",
];

export default function AIGenerator({ onCardsGenerated, isLoading, setIsLoading }: AIGeneratorProps) {
  const [topic, setTopic] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleGenerate = async (topicValue: string) => {
    const activeTopic = topicValue.trim();
    if (!activeTopic) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: activeTopic }),
      });

      if (!response.ok) {
        throw new Error("Generation endpoint responded with an error status.");
      }

      const data = await response.json();
      if (data && Array.isArray(data.flashcards)) {
        // Map elements to standard structures with clean IDs
        const mappedCards: Flashcard[] = data.flashcards.map((card: any, idx: number) => ({
          id: `ai-${Date.now()}-${idx}`,
          front: card.front || card.question || "Empty front",
          back: card.back || card.answer || "Empty back",
          isMastered: false,
        }));
        onCardsGenerated(mappedCards, data.source || "local", activeTopic);
      } else {
        throw new Error("No flashcards received from backend generator.");
      }
    } catch (err) {
      console.error(err);
      setError("An issue occurred during generation. We've fallback directly to client mockup cards.");
      
      // Client-side local fallback generation
      setTimeout(() => {
        const dummyCards: Flashcard[] = [
          {
            id: `fallback-${Date.now()}-1`,
            front: `What is the core definition of ${activeTopic}?`,
            back: `This refers to the primary framework, central themes, and concepts key to studying "${activeTopic}".`,
            isMastered: false
          },
          {
            id: `fallback-${Date.now()}-2`,
            front: `Explain a primary principle inside ${activeTopic}.`,
            back: `An integrated pillar supporting the practice, methodology, or learning path of ${activeTopic}.`,
            isMastered: false
          },
          {
            id: `fallback-${Date.now()}-3`,
            front: `What is a common pitfall when understanding ${activeTopic}?`,
            back: `Misinterpreting variables, confusing terms, or failing to relate theories back to hands-on practical implementation structure.`,
            isMastered: false
          },
          {
            id: `fallback-${Date.now()}-4`,
            front: `Mention a practical, real-world scenario of ${activeTopic}.`,
            back: `A demonstration showing where theories and rules of this discipline translate directly to physical systems, industry automation, or conversational practice.`,
            isMastered: false
          },
          {
            id: `fallback-${Date.now()}-5`,
            front: `Why is studying ${activeTopic} highly valuable today?`,
            back: `It provides structural thinking, improves cognitive logic, and adds actionable skills relevant in modern computational or scientific tracks.`,
            isMastered: false
          }
        ];
        onCardsGenerated(dummyCards, "local", activeTopic);
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleGenerate(topic);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase rounded">AI Power</span>
        <h2 className="text-sm font-semibold text-slate-800">Topic Generator</h2>
      </div>
      <p className="text-xs text-slate-500 mb-4">Enter a topic to generate a smart study deck instantly.</p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="topic-input" className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">
            Enter Study Topic or Field
          </label>
          <div className="relative">
            <input
              id="topic-input"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isLoading}
              placeholder="e.g. React Fundamentals"
              className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none mb-3 bg-slate-50 text-slate-800 placeholder:text-slate-400 disabled:opacity-70 transition-all"
            />
            <button
              id="generate-btn"
              type="submit"
              disabled={isLoading || !topic.trim()}
              className="w-full py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-indigo-300" />
              <span>Generate Flashcards</span>
            </button>
          </div>
        </div>

        {/* Suggestion Chips */}
        <div>
          <span className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-tight">
            Popular Quick Decks
          </span>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                id={`suggest-chip-${s.label.replace(/\s+/g, '-').toLowerCase()}`}
                key={s.label}
                type="button"
                disabled={isLoading}
                onClick={() => {
                  setTopic(s.value);
                  handleGenerate(s.value);
                }}
                className="text-xs font-medium text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 py-1.5 px-3 rounded-lg cursor-pointer disabled:opacity-50 transition-all flex items-center gap-1"
              >
                <span>{s.label}</span>
                <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
              </button>
            ))}
          </div>
        </div>
      </form>

      {/* API loading state */}
      {isLoading && (
        <div id="ai-loading-panel" className="mt-5 p-4 bg-emerald-50/50 border border-emerald-100/60 rounded-xl animate-pulse">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-sm font-medium text-emerald-800 transition-all duration-300">
              {LOADING_STEPS[loadingStep]}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div id="ai-error-panel" className="mt-4 p-3 bg-amber-50 border border-amber-200/50 text-amber-800 rounded-xl text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}

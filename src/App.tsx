import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Trash2, Download, Upload, Lightbulb, BookOpen, GraduationCap, RefreshCw, CheckCircle, ListPlus, Activity } from "lucide-react";
import { Flashcard } from "./types";
import AIGenerator from "./components/AIGenerator";
import ManualCreator from "./components/ManualCreator";
import DeckViewer from "./components/DeckViewer";

const DEFAULT_DECK_CARDS: Flashcard[] = [
  {
    id: "default-1",
    front: "What is a Closure in JavaScript?",
    back: "A closure is a function bundled together with references to its surrounding state (lexical environment), letting it access outer scope variables even after the outer function has finished executing.",
    isMastered: false,
  },
  {
    id: "default-2",
    front: "How do you translate 'Where is the library?' into Spanish?",
    back: "¿Dónde está la biblioteca?",
    isMastered: false,
  },
  {
    id: "default-3",
    front: "Explain the concept of Web Accessibility (a11y).",
    back: "The design and creation of websites that can be navigated and used by everyone, including people with physical limitations, visual impairments, cognitive differences, or auditory impairments.",
    isMastered: false,
  },
  {
    id: "default-4",
    front: "What does SQL stand for and what is its primary use?",
    back: "SQL stands for Structured Query Language. It is the standardized programming language used to manage, query, and manipulate relational databases.",
    isMastered: false,
  },
  {
    id: "default-5",
    front: "What is the key benefit of React's Virtual DOM?",
    back: "It optimizes DOM updates by comparing changes in memory (diffing) and only updating the specific nodes that changed, avoiding costly layout recalculations in the real browser DOM.",
    isMastered: false,
  }
];

export default function App() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [activeTopic, setActiveTopic] = useState<string>("SaaS Starter Deck");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize and load persistent deck from localStorage
  useEffect(() => {
    try {
      const persisted = localStorage.getItem("flashcard_generator_deck");
      if (persisted) {
        setCards(JSON.parse(persisted));
        const savedTopic = localStorage.getItem("flashcard_generator_topic");
        if (savedTopic) setActiveTopic(savedTopic);
      } else {
        setCards(DEFAULT_DECK_CARDS);
        setActiveTopic("Starter Deck");
      }
    } catch (e) {
      console.error("Failed to load deck from localStorage", e);
      setCards(DEFAULT_DECK_CARDS);
    }
  }, []);

  // Sync deck updates back to localStorage
  const saveToStorage = (updatedCards: Flashcard[], topicName?: string) => {
    localStorage.setItem("flashcard_generator_deck", JSON.stringify(updatedCards));
    if (topicName) {
      localStorage.setItem("flashcard_generator_topic", topicName);
    }
  };

  const handleCardsGenerated = (generated: Flashcard[], source: "ai" | "local", topic: string) => {
    // Replace current deck with generated AI core or append
    setCards(generated);
    setActiveTopic(topic);
    saveToStorage(generated, topic);
  };

  const handleCardAdded = (newCard: Flashcard) => {
    const updated = [newCard, ...cards];
    setCards(updated);
    saveToStorage(updated);
  };

  const handleToggleMastered = (id: string) => {
    const updated = cards.map((c) => (c.id === id ? { ...c, isMastered: !c.isMastered } : c));
    setCards(updated);
    saveToStorage(updated);
  };

  const handleShuffleDeck = () => {
    if (cards.length <= 1) return;
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    saveToStorage(shuffled);
  };

  const handleClearDeck = () => {
    if (confirm("Are you sure you want to clear your current deck? This action cannot be undone.")) {
      setCards([]);
      setActiveTopic("Empty Workspace");
      saveToStorage([], "Empty Workspace");
    }
  };

  const handleExportJSON = () => {
    if (cards.length === 0) {
      alert("Your deck is currently empty! Create some cards first to export.");
      return;
    }
    const dataObj = {
      name: activeTopic,
      exportedAt: new Date().toISOString(),
      cards: cards,
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataObj, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `deck-${activeTopic.replace(/\s+/g, "-").toLowerCase()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        let importedList: any[] = [];
        let importedTopic = "Imported Deck";

        if (Array.isArray(parsed)) {
          importedList = parsed;
        } else if (parsed && Array.isArray(parsed.cards)) {
          importedList = parsed.cards;
          if (parsed.name) importedTopic = parsed.name;
        } else {
          alert("Unrecognized JSON layout. Verify it contains an array of cards.");
          return;
        }

        const validCards: Flashcard[] = importedList
          .filter((c: any) => typeof c.front === "string" && typeof c.back === "string")
          .map((c: any, index: number) => ({
            id: c.id || `imported-${Date.now()}-${index}`,
            front: c.front,
            back: c.back,
            isMastered: !!c.isMastered,
          }));

        if (validCards.length > 0) {
          const unionCards = [...cards, ...validCards];
          setCards(unionCards);
          setActiveTopic(importedTopic);
          saveToStorage(unionCards, importedTopic);
          alert(`Successfully loaded ${validCards.length} study flashcards!`);
        } else {
          alert("Could not identify any valid flashcards in this JSON file.");
        }
      } catch (err) {
        alert("Invalid file format. Please upload valid exported JSON files.");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // key purge to accept duplicates
  };

  const handleReloadDefault = () => {
    if (confirm("Restore the default starting deck? This will append the starter items.")) {
      const merged = [...cards, ...DEFAULT_DECK_CARDS];
      setCards(merged);
      setActiveTopic("Starter Deck");
      saveToStorage(merged, "Starter Deck");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Premium Header conforming to Geometric Balance */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center shadow-sm shrink-0">
              <div className="w-3.5 h-3.5 bg-white rounded-xs rotate-45"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800 leading-none">Lumina Cards</h1>
              <p className="text-[10px] text-slate-400 mt-1.5 font-bold uppercase tracking-wider">Dynamic Study Studio</p>
            </div>
          </div>

          {/* Persistent Study Management bar style */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-3">
            <button
              id="reload-default-btn"
              onClick={handleReloadDefault}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-md transition-colors cursor-pointer"
              title="Add sample cards"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Load Samples</span>
            </button>

            <button
              id="clear-deck-btn"
              onClick={handleClearDeck}
              disabled={cards.length === 0}
              className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 rounded-md border border-transparent hover:border-slate-200 transition-colors cursor-pointer disabled:opacity-40"
              title="Clear all cards"
            >
              Clear Deck
            </button>

            <div className="hidden sm:block h-4 w-px bg-slate-200"></div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportJSON}
              accept=".json"
              className="hidden"
            />
            <button
              id="import-deck-trigger"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span>Import</span>
            </button>

            <button
              id="export-deck-btn"
              onClick={handleExportJSON}
              disabled={cards.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-md shadow-xs shadow-indigo-100 hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main SaaS Study Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Creator and AI tools */}
          <div className="lg:col-span-4 space-y-6">
            <AIGenerator
              onCardsGenerated={handleCardsGenerated}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />

            <ManualCreator onCardAdded={handleCardAdded} />

            {/* Deck details checklist (Quick Edit) styled like Deck Overview */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm">Deck Overview</h3>
                  <p className="text-[11px] text-slate-400">View and manage target study items</p>
                </div>
                <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100/50 rounded text-[10px] font-bold text-indigo-700">
                  {cards.length} cards
                </span>
              </div>

              {cards.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  No active study cards found. Create some above.
                </div>
              ) : (
                <div className="max-h-[240px] overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                  {cards.map((c, index) => (
                    <div
                      key={c.id}
                      className="group/item flex items-center justify-between gap-3 p-3 bg-white border border-slate-100 hover:border-slate-300 rounded-lg shadow-3xs transition-all text-xs"
                    >
                      <div className="flex-grow min-w-0 pr-1">
                        <p className="text-[10px] text-slate-400 font-bold mb-0.5">CARD {index + 1}</p>
                        <p className="font-medium text-slate-700 truncate">{c.front}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleToggleMastered(c.id)}
                          className={`p-1 rounded border ${
                            c.isMastered
                              ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                              : "bg-white border-slate-100 text-slate-300 hover:text-emerald-500 hover:border-slate-200"
                          } transition-all cursor-pointer`}
                          title={c.isMastered ? "Mastered" : "Study Mode"}
                        >
                          <CheckCircle className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => {
                            const updated = cards.filter((item) => item.id !== c.id);
                            setCards(updated);
                            saveToStorage(updated);
                          }}
                          className="p-1 bg-white border border-slate-100 text-slate-300 hover:text-rose-600 hover:border-rose-100 rounded transition-all cursor-pointer"
                          title="Remove card"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Key Studying Center */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5 mb-6">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded">
                  Current study deck
                </span>
                <h2 className="font-bold text-slate-800 text-lg tracking-tight mt-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>{activeTopic}</span>
                </h2>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>Active session</span>
              </div>
            </div>

            {/* Study viewer with 3D Flip */}
            <DeckViewer
              cards={cards}
              onToggleMaster={handleToggleMastered}
              onShuffle={handleShuffleDeck}
            />
          </div>

        </div>
      </main>

      {/* Standard Elegant Footer */}
      <footer className="bg-white border-t border-slate-200 mt-20 py-8 text-center">
        <p className="text-xs text-slate-400">
          Created with Google Gemini 3.5. Powered by full-stack TypeScript, Express & React.
        </p>
      </footer>
    </div>
  );
}

import React, { useState } from "react";
import { Plus, LayoutGrid, HelpCircle, FileText } from "lucide-react";
import { Flashcard } from "../types";

interface ManualCreatorProps {
  onCardAdded: (card: Flashcard) => void;
}

export default function ManualCreator({ onCardAdded }: ManualCreatorProps) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanFront = front.trim();
    const cleanBack = back.trim();

    if (!cleanFront || !cleanBack) {
      setError("Please fill in both the Front (Question) and Back (Answer) fields.");
      return;
    }

    const newCard: Flashcard = {
      id: `manual-${Date.now()}`,
      front: cleanFront,
      back: cleanBack,
      isMastered: false,
    };

    onCardAdded(newCard);
    setFront("");
    setBack("");
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <h2 className="text-sm font-semibold mb-4 text-slate-800">Add Manual Card</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="card-front" className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" />
            Front (Question)
          </label>
          <textarea
            id="card-front"
            rows={3}
            value={front}
            onChange={(e) => setFront(e.target.value)}
            placeholder="Ask something..."
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50 text-slate-800 placeholder:text-slate-400 transition-all resize-none"
          />
        </div>

        <div>
          <label htmlFor="card-back" className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" />
            Back (Answer)
          </label>
          <textarea
            id="card-back"
            rows={4}
            value={back}
            onChange={(e) => setBack(e.target.value)}
            placeholder="The explanation is..."
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50 text-slate-800 placeholder:text-slate-400 transition-all resize-none"
          />
        </div>

        {error && (
          <p id="manual-error" className="text-xs text-rose-500 font-medium">
            {error}
          </p>
        )}

        <button
          id="add-card-btn"
          type="submit"
          className="w-full py-2 border-2 border-dashed border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-slate-50 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add to Deck</span>
        </button>
      </form>
    </div>
  );
}

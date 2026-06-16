import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, RotateCw, Award, Activity, HelpCircle, CheckCircle2, RotateCcw, Shuffle } from "lucide-react";
import { Flashcard } from "../types";

interface DeckViewerProps {
  cards: Flashcard[];
  onToggleMaster: (id: string) => void;
  onShuffle: () => void;
}

export default function DeckViewer({ cards, onToggleMaster, onShuffle }: DeckViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // If cards list length shrinks, clamp the current index
  useEffect(() => {
    if (currentIndex >= cards.length) {
      setCurrentIndex(Math.max(0, cards.length - 1));
    }
    // Always unflip card on deck update
    setIsFlipped(false);
  }, [cards.length, currentIndex]);

  // Support study hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (cards.length === 0) return;
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
        return; // ignore when typing in forms
      }

      if (e.code === "Space") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === "ArrowRight") {
        handleNext();
      } else if (e.code === "ArrowLeft") {
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cards.length, currentIndex]);

  if (cards.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-12 text-center max-w-md mx-auto my-8">
        <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3.5" />
        <h3 className="font-semibold text-slate-700 mb-1">No Flashcards Yet</h3>
        <p className="text-xs text-slate-500 max-w-xs mx-auto mb-5">
          Type an educational topic on the left to generate using AI, or manually write items using the custom creator.
        </p>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / cards.length) * 100);
  const masteredCount = cards.filter((c) => c.isMastered).length;
  const masteryPercent = Math.round((masteredCount / cards.length) * 100);

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev < cards.length - 1 ? prev + 1 : 0));
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : cards.length - 1));
    }, 150);
  };

  const handlePlayAgain = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  return (
    <div className="space-y-8">
      {/* Metrics Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-semibold text-slate-600">
            Study Session • {cards.length} Core cards
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-semibold text-indigo-700">
            Mastered: {masteredCount} cards ({masteryPercent}%)
          </span>
        </div>
      </div>

      {/* Primary 3D Studying viewport with stack effects */}
      <div className="flex justify-center py-4 relative">
        {/* Geometric Balance Card Stack Decoration (Simulates background pile beautifully) */}
        <div className="absolute w-full max-w-xl aspect-[1.8/1] min-h-[220px] sm:min-h-[260px] bg-slate-100 border border-slate-200/60 rounded-3xl translate-x-3.5 translate-y-3.5 opacity-40"></div>
        <div className="absolute w-full max-w-xl aspect-[1.8/1] min-h-[220px] sm:min-h-[260px] bg-slate-100 border border-slate-200/60 rounded-3xl translate-x-1.5 translate-y-1.5 opacity-70"></div>

        <div 
          id="flashcard-3d-wrapper"
          className="perspective-1000 w-full max-w-xl aspect-[1.8/1] min-h-[220px] sm:min-h-[260px] cursor-pointer group select-none relative z-10"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div className={`relative w-full h-full duration-500 preserve-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
            
            {/* Front Side Card */}
            <div className="absolute inset-0 w-full h-full backface-hidden bg-white border border-slate-200 rounded-3xl shadow-lg p-6 sm:p-10 flex flex-col justify-between transition-shadow">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <span>Card {currentIndex + 1} • FrontSide</span>
                </div>
                {currentCard.isMastered && (
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[9px] uppercase font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Mastered
                  </span>
                )}
              </div>
              <div className="flex items-center justify-center py-4 flex-grow">
                <p className="text-xl sm:text-2xl font-medium text-slate-800 text-center max-w-md break-words self-center leading-relaxed">
                  {currentCard.front}
                </p>
              </div>
              <div className="flex justify-center items-center gap-1.5 text-xs text-slate-400 font-medium hover:text-indigo-600 transition-colors">
                <RotateCw className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform" />
                <span>Click to reveal answer</span>
              </div>
            </div>

            {/* Back Side Card */}
            <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-slate-900 border border-slate-950 rounded-3xl shadow-xl p-6 sm:p-10 flex flex-col justify-between">
              <div className="flex justify-between items-center text-[10px] font-bold text-emerald-400 tracking-widest uppercase">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span>Card {currentIndex + 1} • BackSide</span>
                </div>
              </div>
              <div className="flex items-center justify-center py-4 flex-grow overflow-y-auto">
                <p className="text-sm sm:text-base text-zinc-100 text-center whitespace-pre-wrap max-w-md break-words leading-relaxed font-sans">
                  {currentCard.back}
                </p>
              </div>
              <div className="flex justify-center items-center gap-1.5 text-xs text-zinc-400 font-medium">
                <RotateCw className="w-3.5 h-3.5 text-emerald-400" />
                <span>Click to flip back</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Progress Bars (Geometric Balance Spec) */}
      <div className="space-y-4 pt-1">
        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
          <div
            id="deck-progress-bar"
            style={{ width: `${progressPercent}%` }}
            className="h-full bg-indigo-600 rounded-full transition-all duration-300"
          ></div>
        </div>
      </div>

      {/* Controls & Nav Area (Circular control styling from details) */}
      <div className="flex flex-col items-center gap-6 pb-2">
        <div className="flex items-center justify-center gap-6 sm:gap-12 w-full">
          <button
            id="prev-card-btn"
            onClick={handlePrev}
            className="w-11 h-11 flex items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-xs transition-colors cursor-pointer shrink-0"
            title="Previous (Left Arrow)"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex flex-col items-center">
            <span className="text-sm font-bold text-slate-800">Card {currentIndex + 1} of {cards.length}</span>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-1">{progressPercent}% Complete</span>
          </div>

          <button
            id="next-card-btn"
            onClick={handleNext}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-slate-800 text-white hover:bg-slate-700 shadow-sm transition-colors cursor-pointer shrink-0"
            title="Next (Right Arrow)"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Action controllers (Mastery flagger and Shuffler) */}
        <div className="flex items-center gap-3 w-full max-w-xs justify-center pt-2 border-t border-slate-100">
          <button
            id="master-toggle-btn"
            onClick={() => onToggleMaster(currentCard.id)}
            className={`flex-1 max-w-[150px] py-1.5 px-3 rounded-md border font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              currentCard.isMastered
                ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600"
            }`}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${currentCard.isMastered ? "text-emerald-600" : "text-slate-400"}`} />
            <span>{currentCard.isMastered ? "Mastered" : "Learn"}</span>
          </button>

          <button
            id="shuffle-deck-btn"
            onClick={onShuffle}
            className="flex-1 max-w-[150px] py-1.5 px-3 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
            title="Randomize card list sequence"
          >
            <Shuffle className="w-3.5 h-3.5 text-slate-400" />
            <span>Shuffle</span>
          </button>
        </div>
      </div>

      {/* Guide label */}
      <p className="text-[11px] text-slate-400 text-center leading-tight">
        💡 <strong className="text-slate-500 font-semibold">Study shortcuts:</strong> Press <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-500 rounded text-[9px]">Space</kbd> to flip, and <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-500 rounded text-[9px]">Left / Right Keys</kbd> to navigate cards.
      </p>
    </div>
  );
}

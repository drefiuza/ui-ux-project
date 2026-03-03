"use client";

import { useEffect, useState, useCallback } from "react";
import { categories, projects } from "@/lib/projects";
import {
  Trophy,
  Search,
  Palette,
  Accessibility,
  RefreshCw,
  Bot,
  CakeSlice,
} from "lucide-react";

const CONFETTI = ["🎉", "🏆", "⭐", "✨", "🎊"];

function spawnConfetti(container: HTMLElement) {
  for (let i = 0; i < 12; i++) {
    const span = document.createElement("span");
    span.textContent = CONFETTI[Math.floor(Math.random() * CONFETTI.length)];
    span.style.cssText = `
      position: absolute;
      font-size: ${14 + Math.random() * 10}px;
      left: ${Math.random() * 100}%;
      top: 50%;
      pointer-events: none;
      animation: confetti-pop ${0.6 + Math.random() * 0.4}s ease-out forwards;
      --tx: ${(Math.random() - 0.5) * 120}px;
      --ty: ${-30 - Math.random() * 60}px;
    `;
    container.appendChild(span);
    setTimeout(() => span.remove(), 1200);
  }
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Trophy,
  Search,
  Palette,
  Accessibility,
  RefreshCw,
  Bot,
  CakeSlice,
};

export default function ResultsPage() {
  const [results, setResults] = useState<Record<string, string> | null>(null);
  const [totalVoters, setTotalVoters] = useState(0);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/results-8f3k2x")
      .then((r) => r.json())
      .then((data) => {
        setResults(data.results);
        setTotalVoters(data.totalVoters);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleReveal = useCallback(
    (key: string, e: React.MouseEvent<HTMLButtonElement>) => {
      if (revealed.has(key)) return;
      const target = e.currentTarget;
      setRevealed((prev) => new Set(prev).add(key));
      spawnConfetti(target);
    },
    [revealed]
  );

  if (loading) {
    return (
      <main className="max-w-lg mx-auto px-5 py-16 text-center">
        <p className="text-gray-400">Loading results...</p>
      </main>
    );
  }

  if (!results) {
    return (
      <main className="max-w-lg mx-auto px-5 py-16 text-center">
        <p className="text-gray-400">Could not load results.</p>
      </main>
    );
  }

  return (
    <main className="max-w-lg mx-auto px-5 py-10">
      <style>{`
        @keyframes confetti-pop {
          0% { opacity: 1; transform: translate(0, 0) scale(0.5); }
          100% { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(1.2); }
        }
      `}</style>
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Winners</h1>
        <p className="text-gray-400 mt-1">
          {totalVoters} {totalVoters === 1 ? "vote" : "votes"} cast
        </p>
      </div>

      <div className="space-y-4">
        {categories.map((cat) => {
          const Icon = iconMap[cat.icon];
          const winnerName = results[cat.key];
          const winner = projects.find((p) => p.name === winnerName);

          const isRevealed = revealed.has(cat.key);

          return (
            <button
              key={cat.key}
              type="button"
              onClick={(e) => handleReveal(cat.key, e)}
              className={`relative overflow-hidden w-full text-left rounded-xl border border-gray-200 bg-white px-5 py-4 transition-all ${!isRevealed ? "cursor-pointer hover:border-gray-300 hover:shadow-sm" : ""}`}
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                <Icon className="w-4 h-4" />
                {cat.label}
              </div>
              {isRevealed ? (
                winner ? (
                  <>
                    <p className="text-base font-semibold">{winner.name}</p>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {winner.description}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-500 italic">No votes yet</p>
                )
              ) : (
                <p className="text-sm text-gray-500">
                  Tap to reveal winner
                </p>
              )}
            </button>
          );
        })}
      </div>
    </main>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { categories, projects, type CategoryKey } from "@/lib/projects";
import {
  Trophy,
  Search,
  Palette,
  Accessibility,
  RefreshCw,
  Bot,
  CakeSlice,
  ChevronDown,
  CheckCircle2,
  User,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Trophy,
  Search,
  Palette,
  Accessibility,
  RefreshCw,
  Bot,
  CakeSlice,
};

function ProjectDropdown({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selected = projects.find((p) => p.name === value);

  return (
    <div ref={ref} className="relative">
      <button
        id={id}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left appearance-none rounded-xl border border-gray-200 px-4 py-3 pr-10 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow"
      >
        {selected ? (
          <span>{selected.name}</span>
        ) : (
          <span className="text-gray-500">Select a project...</span>
        )}
        <ChevronDown
          className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul className="absolute z-50 mt-1 w-full max-h-72 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
          {projects.map((p) => (
            <li key={p.name}>
              <button
                type="button"
                onClick={() => {
                  onChange(p.name);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${value === p.name ? "bg-gray-50" : ""}`}
              >
                <span className="block text-sm font-medium">{p.name}</span>
                <span className="block text-xs text-gray-400 mt-0.5 line-clamp-2">
                  {p.description}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const STORAGE_KEY = "ux-fair-draft";
const SUBMITTED_KEY = "ux-fair-submitted";

function loadDraft(): {
  voterName: string;
  votes: Record<CategoryKey, string>;
} | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function VotingPage() {
  const emptyVotes = Object.fromEntries(
    categories.map((c) => [c.key, ""])
  ) as Record<CategoryKey, string>;

  const [voterName, setVoterName] = useState("");
  const [votes, setVotes] = useState<Record<CategoryKey, string>>(emptyVotes);
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [loaded, setLoaded] = useState(false);

  // Load draft or submitted state from localStorage
  useEffect(() => {
    if (localStorage.getItem(SUBMITTED_KEY)) {
      const draft = loadDraft();
      if (draft) setVoterName(draft.voterName);
      setStatus("success");
    } else {
      const draft = loadDraft();
      if (draft) {
        setVoterName(draft.voterName);
        setVotes(draft.votes);
      }
    }
    setLoaded(true);
  }, []);

  // Persist draft to localStorage on change
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ voterName, votes })
    );
  }, [voterName, votes, loaded]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    setMessage("");

    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voter_name: voterName, ...votes }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error);
        return;
      }

      localStorage.setItem(SUBMITTED_KEY, "true");
      setStatus("success");
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  if (!loaded) {
    return null;
  }

  if (status === "success") {
    return (
      <main className="max-w-lg mx-auto px-5 py-16 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Thanks, {voterName}!</h1>
        <p className="text-gray-500">Your votes have been recorded.</p>
      </main>
    );
  }

  return (
    <main className="max-w-lg mx-auto px-5 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">
          UI/UX Project Fair
        </h1>
        <p className="text-gray-400 mt-1">
          Vote for your favorites in each category
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="voter_name"
            className="flex items-center gap-2 text-sm font-semibold mb-2"
          >
            <User className="w-4 h-4 text-gray-400" />
            Name
          </label>
          <input
            id="voter_name"
            type="text"
            required
            value={voterName}
            onChange={(e) => setVoterName(e.target.value)}
            placeholder="Name"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm bg-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow"
          />
        </div>

        <hr className="border-gray-100" />

        {categories.map((cat) => {
          const Icon = iconMap[cat.icon];
          return (
            <div key={cat.key}>
              <label
                htmlFor={cat.key}
                className="flex items-center gap-2 text-sm font-semibold mb-2"
              >
                <Icon className="w-4 h-4 text-gray-400" />
                {cat.label}
              </label>
              <ProjectDropdown
                id={cat.key}
                value={votes[cat.key]}
                onChange={(name) =>
                  setVotes((prev) => ({ ...prev, [cat.key]: name }))
                }
              />
            </div>
          );
        })}

        {status === "error" && (
          <div className="rounded-xl bg-red-50 border border-red-100 text-red-600 px-4 py-3 text-sm">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full rounded-xl bg-gray-900 text-white py-3 text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {status === "submitting" ? "Submitting..." : "Submit Votes"}
        </button>
      </form>
    </main>
  );
}

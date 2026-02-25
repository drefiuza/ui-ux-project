"use client";

import { useState } from "react";
import { categories, projects, type CategoryKey } from "@/lib/projects";

export default function VotingPage() {
  const [voterName, setVoterName] = useState("");
  const [votes, setVotes] = useState<Record<CategoryKey, string>>(
    Object.fromEntries(categories.map((c) => [c.key, ""])) as Record<
      CategoryKey,
      string
    >
  );
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

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

      setStatus("success");
      setMessage("Vote submitted! Thank you 🎉");
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <main className="max-w-lg mx-auto px-4 py-12 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold mb-2">Thanks, {voterName}!</h1>
        <p className="text-gray-600">Your votes have been recorded.</p>
      </main>
    );
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">UI/UX Project Fair</h1>
        <p className="text-gray-500 mt-1">Vote for your favorites in each category</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="voter_name" className="block text-sm font-medium mb-1">
            Your Name
          </label>
          <input
            id="voter_name"
            type="text"
            required
            value={voterName}
            onChange={(e) => setVoterName(e.target.value)}
            placeholder="Enter your name"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {categories.map((cat) => (
          <div key={cat.key}>
            <label htmlFor={cat.key} className="block text-sm font-medium mb-1">
              {cat.emoji} {cat.label}
            </label>
            <select
              id={cat.key}
              required
              value={votes[cat.key]}
              onChange={(e) =>
                setVotes((prev) => ({ ...prev, [cat.key]: e.target.value }))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="" disabled>
                Select a project…
              </option>
              {projects.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        ))}

        {status === "error" && (
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full rounded-lg bg-blue-600 text-white py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {status === "submitting" ? "Submitting…" : "Submit Votes"}
        </button>
      </form>
    </main>
  );
}

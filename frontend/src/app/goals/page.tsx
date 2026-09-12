"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Target, Trash2, TrendingUp, X } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { currentCustomerId } from "@/lib/api";
import { useGoals, addGoal, contribute, deleteGoal } from "@/lib/goals";
import { formatCurrency, cn } from "@/lib/utils";

const EMOJI_CHOICES = ["🏠", "🚗", "✈️", "🎓", "💍", "🏥", "📱", "🎯"];

export default function GoalsPage() {
  const cid = currentCustomerId();
  const goals = useGoals(cid);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [emoji, setEmoji] = useState(EMOJI_CHOICES[0]);
  const [contribInputs, setContribInputs] = useState<Record<string, string>>({});

  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = goals.reduce((s, g) => s + g.savedAmount, 0);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(target.replace(/\D/g, ""));
    if (!title.trim() || amt <= 0) return;
    addGoal({
      customerId: cid,
      title: title.trim(),
      targetAmount: amt,
      deadline: deadline || undefined,
      emoji,
    });
    setTitle(""); setTarget(""); setDeadline(""); setEmoji(EMOJI_CHOICES[0]);
    setShowCreate(false);
  };

  return (
    <PageShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-light tracking-tight">Your goals</h1>
            <p className="text-xs font-light text-saarthi-text-secondary mt-0.5">
              Set aside money for what matters. Saarthi tracks the progress.
            </p>
          </div>
          <button
            onClick={() => setShowCreate((v) => !v)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-saarthi-healthy text-saarthi-bg text-xs font-medium hover:bg-saarthi-healthy/90 transition-all self-start sm:self-auto"
          >
            {showCreate ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {showCreate ? "Close" : "New goal"}
          </button>
        </div>

        {goals.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <SummaryCard label="Active goals" value={String(goals.length)} />
            <SummaryCard label="Total saved" value={formatCurrency(totalSaved)} accent />
            <SummaryCard label="Total target" value={formatCurrency(totalTarget)} />
          </div>
        )}

        {showCreate && (
          <motion.form
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            onSubmit={handleCreate}
            className="card space-y-3 p-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-saarthi-text-muted">Goal name</span>
                <input required value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="Emergency fund" className={inputCls} />
              </label>
              <label className="block space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-saarthi-text-muted">Target amount (₹)</span>
                <input required inputMode="numeric" value={target}
                  onChange={(e) => setTarget(e.target.value.replace(/\D/g, ""))}
                  placeholder="50000" className={inputCls} />
              </label>
              <label className="block space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-saarthi-text-muted">Target date (optional)</span>
                <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={inputCls} />
              </label>
              <label className="block space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-saarthi-text-muted">Icon</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {EMOJI_CHOICES.map((e) => (
                    <button key={e} type="button" onClick={() => setEmoji(e)}
                      className={cn(
                        "w-8 h-8 rounded-md text-base border transition-colors",
                        emoji === e
                          ? "border-saarthi-healthy bg-saarthi-healthy/10"
                          : "border-saarthi-border-subtle hover:border-saarthi-border-active",
                      )}>{e}</button>
                  ))}
                </div>
              </label>
            </div>
            <div className="flex justify-end">
              <button type="submit"
                className="px-4 py-2 rounded-md bg-saarthi-healthy text-saarthi-bg text-xs font-medium hover:bg-saarthi-healthy/90">
                Create goal
              </button>
            </div>
          </motion.form>
        )}

        {goals.length === 0 && !showCreate ? (
          <div className="card text-center py-14 space-y-3">
            <Target className="w-8 h-8 mx-auto text-saarthi-healthy" />
            <h3 className="text-base font-normal">No goals yet</h3>
            <p className="text-xs font-light text-saarthi-text-secondary max-w-sm mx-auto">
              Set your first goal — an emergency fund, a trip, a down payment — and Saarthi will help you get there.
            </p>
            <button onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-saarthi-healthy text-saarthi-bg text-xs font-medium hover:bg-saarthi-healthy/90 transition-all">
              <Plus className="w-3.5 h-3.5" />
              Create your first goal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {goals.map((g) => {
              const pct = g.targetAmount > 0 ? Math.min(100, (g.savedAmount / g.targetAmount) * 100) : 0;
              const done = pct >= 100;
              const input = contribInputs[g.id] ?? "";
              return (
                <div key={g.id} className="card p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl leading-none">{g.emoji}</span>
                      <div className="min-w-0">
                        <h3 className="text-sm font-normal truncate">{g.title}</h3>
                        <p className="text-[11px] font-light text-saarthi-text-muted">
                          {formatCurrency(g.savedAmount)} of {formatCurrency(g.targetAmount)}
                          {g.deadline ? ` · by ${new Date(g.deadline).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}` : ""}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => deleteGoal(g.id)}
                      title="Delete goal"
                      className="p-1 rounded text-saarthi-text-muted hover:text-saarthi-stressed transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="h-1.5 rounded-full bg-saarthi-elevated overflow-hidden">
                    <div
                      className={cn("h-full transition-all duration-500",
                        done ? "bg-saarthi-healthy" : "bg-saarthi-healthy/70")}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className={cn(done ? "text-saarthi-healthy" : "text-saarthi-text-muted")}>
                      {done ? "Goal complete 🎉" : `${pct.toFixed(0)}% saved`}
                    </span>
                    <span className="text-saarthi-text-muted">
                      Remaining {formatCurrency(Math.max(0, g.targetAmount - g.savedAmount))}
                    </span>
                  </div>

                  {!done && (
                    <div className="flex items-center gap-2 pt-1">
                      <input inputMode="numeric" placeholder="Add ₹"
                        value={input}
                        onChange={(e) => setContribInputs((s) => ({ ...s, [g.id]: e.target.value.replace(/\D/g, "") }))}
                        className={cn(inputCls, "flex-1")} />
                      <button
                        type="button"
                        disabled={!input}
                        onClick={() => {
                          const amt = Number(input);
                          if (amt > 0) {
                            contribute(g.id, amt);
                            setContribInputs((s) => ({ ...s, [g.id]: "" }));
                          }
                        }}
                        className="px-3 py-2 rounded-md bg-saarthi-healthy text-saarthi-bg text-xs font-medium hover:bg-saarthi-healthy/90 disabled:opacity-40 transition-all inline-flex items-center gap-1"
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        Add
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageShell>
  );
}

const inputCls =
  "w-full bg-saarthi-card border border-saarthi-border-subtle rounded-md px-3 py-2 text-sm font-light text-saarthi-text-primary placeholder:text-saarthi-text-muted focus:outline-none focus:border-saarthi-healthy/50 transition-colors";

function SummaryCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="card p-3">
      <div className="text-[10px] uppercase tracking-wider text-saarthi-text-muted">{label}</div>
      <div className={cn("text-lg font-light mt-1", accent ? "text-saarthi-healthy" : "text-saarthi-text-primary")}>
        {value}
      </div>
    </div>
  );
}

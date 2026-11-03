import { useState } from "react";
import Card from "./Card.jsx";
import useLocalStorage from "../hooks/useLocalStorage.js";

// Helpers that live OUTSIDE the component don't get re-created every render.
function dateKey(d) {
  // "2026-11-03" (local date, not UTC)
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function lastSevenDays() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      key: dateKey(d),
      label: d.toLocaleDateString("en", { weekday: "narrow" }),
      isToday: i === 0,
    });
  }
  return days;
}

export default function HabitTracker() {
  // habits: [{ id, name, done: ["2026-11-03", ...] }]
  const [habits, setHabits] = useLocalStorage("ld-habits", [
    { id: 1, name: "Code for 1 hour", done: [] },
    { id: 2, name: "Drink water", done: [] },
  ]);
  const [name, setName] = useState("");
  const days = lastSevenDays();

  function addHabit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setHabits([...habits, { id: Date.now(), name: trimmed, done: [] }]);
    setName("");
  }

  function toggle(habitId, key) {
    setHabits(
      habits.map((h) => {
        if (h.id !== habitId) return h;
        const has = h.done.includes(key);
        return {
          ...h,
          done: has ? h.done.filter((k) => k !== key) : [...h.done, key],
        };
      })
    );
  }

  function removeHabit(id) {
    setHabits(habits.filter((h) => h.id !== id));
  }

  // Streak = consecutive days ending today (or yesterday if today isn't done yet).
  function streak(h) {
    let count = 0;
    const d = new Date();
    if (!h.done.includes(dateKey(d))) d.setDate(d.getDate() - 1);
    while (h.done.includes(dateKey(d))) {
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  }

  return (
    <Card title="Habits" subtitle="last 7 days" className="card-habits">
      <div className="habit-grid">
        <div className="habit-row habit-header">
          <span />
          {days.map((d) => (
            <span key={d.key} className={d.isToday ? "today-label" : ""}>
              {d.label}
            </span>
          ))}
          <span />
        </div>

        {habits.map((h) => (
          <div className="habit-row" key={h.id}>
            <span className="habit-name">
              {h.name}
              <small>{streak(h)} day streak</small>
            </span>
            {days.map((d) => {
              const on = h.done.includes(d.key);
              return (
                <button
                  key={d.key}
                  className={`dot ${on ? "on" : ""} ${d.isToday ? "today" : ""}`}
                  onClick={() => toggle(h.id, d.key)}
                  aria-pressed={on}
                  aria-label={`${h.name} on ${d.key}`}
                />
              );
            })}
            <button
              className="icon-btn"
              onClick={() => removeHabit(h.id)}
              aria-label={`Delete ${h.name}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={addHabit} className="todo-form">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New habit…"
          aria-label="New habit"
        />
        <button type="submit">Add</button>
      </form>
    </Card>
  );
}

import { useState, useEffect } from "react";
import Card from "./Card.jsx";
import useLocalStorage from "../hooks/useLocalStorage.js";

const PRESETS = [15, 25, 45]; // minutes

function format(totalSeconds) {
  const m = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export default function FocusTimer() {
  const [minutes, setMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useLocalStorage("ld-sessions", {});

  const today = new Date().toDateString();
  const doneToday = sessions[today] || 0;

  // The classic useEffect + setInterval pattern.
  useEffect(() => {
    if (!running) return; // nothing to do while paused

    const id = setInterval(() => {
      // Use the "updater" form so we always get the latest value.
      setSecondsLeft((s) => s - 1);
    }, 1000);

    // CLEANUP: stop the interval when paused/unmounted. Forgetting this
    // is the #1 timer bug in React.
    return () => clearInterval(id);
  }, [running]);

  // A second effect that watches the countdown and reacts when it hits zero.
  useEffect(() => {
    if (secondsLeft <= 0 && running) {
      setRunning(false);
      setSecondsLeft(minutes * 60);
      setSessions((prev) => ({ ...prev, [today]: (prev[today] || 0) + 1 }));
    }
  }, [secondsLeft, running, minutes, today, setSessions]);

  // Show the time in the browser tab title while it's running.
  useEffect(() => {
    document.title = running ? `${format(secondsLeft)} · Focus` : "Today";
  }, [running, secondsLeft]);

  function pick(m) {
    setRunning(false);
    setMinutes(m);
    setSecondsLeft(m * 60);
  }

  function reset() {
    setRunning(false);
    setSecondsLeft(minutes * 60);
  }

  const progress = 1 - secondsLeft / (minutes * 60);
  const R = 70;
  const C = 2 * Math.PI * R;

  return (
    <Card title="Focus" subtitle={`${doneToday} session${doneToday === 1 ? "" : "s"} today`} className="card-timer">
      <div className="timer-ring">
        <svg viewBox="0 0 160 160" aria-hidden="true">
          <circle className="ring-bg" cx="80" cy="80" r={R} />
          <circle
            className="ring-fg"
            cx="80"
            cy="80"
            r={R}
            strokeDasharray={C}
            strokeDashoffset={C * (1 - progress)}
          />
        </svg>
        <div className="timer-text">{format(secondsLeft)}</div>
      </div>

      <div className="presets">
        {PRESETS.map((m) => (
          <button
            key={m}
            className={`chip ${m === minutes ? "active" : ""}`}
            onClick={() => pick(m)}
          >
            {m} min
          </button>
        ))}
      </div>

      <div className="timer-actions">
        <button className="primary" onClick={() => setRunning(!running)}>
          {running ? "Pause" : "Start"}
        </button>
        <button className="ghost" onClick={reset}>
          Reset
        </button>
      </div>
    </Card>
  );
}

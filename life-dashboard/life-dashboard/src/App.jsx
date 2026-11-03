import TodoList from "./components/TodoList.jsx";
import HabitTracker from "./components/HabitTracker.jsx";
import Weather from "./components/Weather.jsx";
import FocusTimer from "./components/FocusTimer.jsx";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function App() {
  const date = new Date().toLocaleDateString("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="page">
      <header className="hero">
        <p className="eyebrow">{date}</p>
        <h1>
          {greeting()}. <em>What matters today?</em>
        </h1>
      </header>

      <div className="grid">
        <FocusTimer />
        <TodoList />
        <HabitTracker />
        <Weather />
      </div>
    </main>
  );
}

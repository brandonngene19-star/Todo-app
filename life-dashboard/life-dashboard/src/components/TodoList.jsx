import { useState } from "react";
import Card from "./Card.jsx";
import useLocalStorage from "../hooks/useLocalStorage.js";

export default function TodoList() {
  // State #1: the list itself (saved to the browser).
  const [todos, setTodos] = useLocalStorage("ld-todos", []);
  // State #2: what's currently typed in the input box.
  const [text, setText] = useState("");

  function addTodo(e) {
    e.preventDefault(); // stop the form from reloading the page
    const trimmed = text.trim();
    if (!trimmed) return;
    // NEVER change state directly (todos.push). Make a NEW array instead.
    setTodos([...todos, { id: Date.now(), text: trimmed, done: false }]);
    setText("");
  }

  function toggleTodo(id) {
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function removeTodo(id) {
    setTodos(todos.filter((t) => t.id !== id));
  }

  const remaining = todos.filter((t) => !t.done).length;

  return (
    <Card title="To-do" subtitle={`${remaining} left`} className="card-todo">
      <form onSubmit={addTodo} className="todo-form">
        {/* A "controlled input": React state is the single source of truth. */}
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a task…"
          aria-label="New task"
        />
        <button type="submit">Add</button>
      </form>

      {todos.length === 0 ? (
        <p className="empty">Nothing here yet. Add your first task.</p>
      ) : (
        <ul className="todo-list">
          {/* Rendering a list: .map() + a unique `key` on each item. */}
          {todos.map((t) => (
            <li key={t.id} className={t.done ? "done" : ""}>
              <label>
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={() => toggleTodo(t.id)}
                />
                <span>{t.text}</span>
              </label>
              <button
                className="icon-btn"
                onClick={() => removeTodo(t.id)}
                aria-label={`Delete ${t.text}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

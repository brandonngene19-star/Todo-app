import { useState, useEffect } from "react";

// A CUSTOM HOOK: just a function that starts with "use" and calls other hooks.
// It works like useState, but also saves the value in the browser so your
// data survives a page refresh.
export default function useLocalStorage(key, initialValue) {
  // useState can take a function: it runs ONCE, on the first render only.
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // useEffect runs AFTER render. The array at the end lists what it depends on:
  // it re-runs only when `key` or `value` changes.
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage can be blocked; the app still works without it */
    }
  }, [key, value]);

  return [value, setValue];
}

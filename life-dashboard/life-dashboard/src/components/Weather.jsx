import { useState, useEffect } from "react";
import Card from "./Card.jsx";
import useLocalStorage from "../hooks/useLocalStorage.js";

// Open-Meteo is free and needs no API key.
// Weather codes -> a short human description.
function describe(code) {
  if (code === 0) return "Clear sky";
  if (code <= 3) return "Partly cloudy";
  if (code <= 48) return "Foggy";
  if (code <= 57) return "Drizzle";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Rain showers";
  if (code <= 86) return "Snow showers";
  return "Thunderstorm";
}

export default function Weather() {
  const [city, setCity] = useLocalStorage("ld-city", "London");
  const [input, setInput] = useState("");
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  // This effect re-runs whenever `city` changes: that's the dependency array.
  useEffect(() => {
    let cancelled = false; // avoids setting state after the component is gone
    setStatus("loading");

    async function load() {
      try {
        // Step 1: turn the city name into coordinates.
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            city
          )}&count=1`
        );
        const geo = await geoRes.json();
        if (!geo.results?.length) throw new Error("City not found");
        const { latitude, longitude, name, country } = geo.results[0];

        // Step 2: get the current weather for those coordinates.
        const wRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
        );
        const w = await wRes.json();

        if (!cancelled) {
          setData({
            place: `${name}, ${country}`,
            temp: Math.round(w.current.temperature_2m),
            wind: Math.round(w.current.wind_speed_10m),
            summary: describe(w.current.weather_code),
            high: Math.round(w.daily.temperature_2m_max[0]),
            low: Math.round(w.daily.temperature_2m_min[0]),
          });
          setStatus("ready");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    load();
    // CLEANUP: runs before the next effect, or when the component unmounts.
    return () => {
      cancelled = true;
    };
  }, [city]);

  function changeCity(e) {
    e.preventDefault();
    if (input.trim()) {
      setCity(input.trim());
      setInput("");
    }
  }

  return (
    <Card title="Weather" subtitle={data?.place} className="card-weather">
      {status === "loading" && <p className="empty">Checking the sky…</p>}
      {status === "error" && (
        <p className="empty">Couldn't load weather for "{city}". Try another city.</p>
      )}
      {status === "ready" && data && (
        <div className="weather-main">
          <div className="temp">{data.temp}°</div>
          <div className="weather-meta">
            <strong>{data.summary}</strong>
            <span>
              H {data.high}° · L {data.low}° · Wind {data.wind} km/h
            </span>
          </div>
        </div>
      )}
      <form onSubmit={changeCity} className="todo-form">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Change city…"
          aria-label="City"
        />
        <button type="submit">Go</button>
      </form>
    </Card>
  );
}

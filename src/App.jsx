import React, { useEffect, useState } from "react";
import WeatherCard from "./WeatherCard";
import "./styles.css";
import { Analytics } from '@vercel/analytics/react';

const API_KEY = import.meta.env.VITE_API_KEY;

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  // Load history dari localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("history")) || [];
    setHistory(saved);
  }, []);

  // Simpan history
  useEffect(() => {
    localStorage.setItem("history", JSON.stringify(history));
  }, [history]);

  async function fetchWeather(query) {
    if (!query) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${API_KEY}&units=metric`
      );
      const data = await res.json();

      if (data.cod === "404") {
        setError("Kota tidak ditemukan");
        setWeather(null);
      } else {
        setWeather(data);

        // simpan ke history (hindari duplikat)
        setHistory(prev => {
          const updated = [query, ...prev.filter(c => c !== query)];
          return updated.slice(0, 5);
        });
      }
    } catch {
      setError("Terjadi error");
    }

    setLoading(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    fetchWeather(city);
    setCity("");
  }

  // 🌍 Auto detect lokasi
  function detectLocation() {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;

      setLoading(true);

      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
      );

      const data = await res.json();
      setWeather(data);
      setLoading(false);
    });
  }

  return (
    <div className={`app ${darkMode ? "dark" : ""}`}>
      <h1>Weather App</h1>
      {/* CREDIT */}
      <p className="credit">MBB</p>
      {/* DARK MODE */}
      <button onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? "Light Mode" : "Dark Mode"}
      </button>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Masukkan kota..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button type="submit">Cari</button>
      </form>

      <button onClick={detectLocation}>
        Gunakan Lokasi Saya
      </button>

      {/* HISTORY */}
      <div className="history">
        {history.map((item, i) => (
          <button key={i} onClick={() => fetchWeather(item)}>
            {item}
          </button>
        ))}
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      {weather && <WeatherCard data={weather} />}

      {/* ... */}
      <Analytics />
    </div>
  );
}
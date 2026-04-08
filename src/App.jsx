import React, { useEffect, useState, useRef } from "react";
import WeatherCard from "./WeatherCard";
import "./styles.css";
import Forecast from "./Forecast";
import { Analytics } from '@vercel/analytics/react';

const API_KEY = import.meta.env.VITE_API_KEY;

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [forecast, setForecast] = useState([]);
  const [lastCity, setLastCity] = useState("");

  const weatherRef = useRef(null);

  // Load history dari localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("history")) || [];
    setHistory(saved);
  }, []);

  // Simpan history
  useEffect(() => {
    localStorage.setItem("history", JSON.stringify(history));
  }, [history]);

  // Auto Load Last City
  useEffect(() => {
    if (weather) {
      localStorage.setItem("lastCity", weather.name);
    }
  }, [weather]);

  useEffect(() => {
    const last = localStorage.getItem("lastCity");
    if (last) {
      fetchWeather(last);
    }
  }, []);

  // Scroll Effect
  useEffect(() => {
    if (weather && weatherRef.current) {
      weatherRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  }, [weather]);

  async function fetchWeather(query) {
    if (!query) return;

    setLoading(true);
    setError("");

    try {
      // CURRENT WEATHER
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${API_KEY}&units=metric`
      );
      const data = await res.json();

      // FORECAST
      const resForecast = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${query}&appid=${API_KEY}&units=metric`
      );
      const forecastData = await resForecast.json();

      if (data.cod === "404") {
        setError("Kota tidak ditemukan");
        setWeather(null);
        setForecast([]);
      } else {
        setWeather(data);
        setForecast(forecastData.list);

        setHistory((prev) => {
          const cityName = data.name;

          const filtered = prev.filter((item) => item !== cityName);
          return [cityName, ...filtered].slice(0, 5);
        });
      }

    } catch {
      setError("Terjadi error");
    }

    setLoading(false);
  }

  function getDailyForecast(list) {
    const daily = {};

    list.forEach(item => {
      const date = item.dt_txt.split(" ")[0];

      if (!daily[date]) {
        daily[date] = item;
      }
    });

    return Object.values(daily).slice(0, 5);
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
          placeholder="Cari kota (contoh: Bandung)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Cari"}
        </button>
      </form>

      <button onClick={detectLocation}>
        Gunakan Lokasi Saya
      </button>

      {/* HISTORY */}
      {history.length > 0 && (
        <div className="history">
          {history.map((item, i) => (
            <button key={i} onClick={() => {
                setCity(item);
                fetchWeather(item);
              }}>
              {item}
            </button>
          ))}
        </div>
      )}

      {!weather && !loading && (
        <p style={{ textAlign: "center", opacity: 0.6 }}>
          Cari kota untuk melihat cuaca 🌤️
        </p>
      )}

      {loading && (
        <div className="skeleton-card">
          <div className="skeleton title"></div>
          <div className="skeleton icon"></div>
          <div className="skeleton temp"></div>
        </div>
      )}
      {error && (
        <div className="error-box">
          ⚠️ {error}
        </div>
      )}

      {weather && (
        <div ref={weatherRef} className="fade-in">
          <WeatherCard data={weather} />
        </div>
      )}

      {forecast.length > 0 && (
        <div className="fade-in-delay">
          <Forecast data={getDailyForecast(forecast)} />
        </div>
      )}

      {/* ... */}
      <Analytics />
    </div>
  );
}
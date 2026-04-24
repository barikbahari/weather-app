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
  const [favorites, setFavorites] = useState([]);
  const [unit, setUnit] = useState("metric");

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

  // Auto Refresh
  useEffect(() => {
    fetchWeather();

    const interval = setInterval(() => {
      fetchWeather();
    }, 600000); // 10 menit

    return () => clearInterval(interval);
  }, []);

  // Favorite City
  useEffect(() => {
    const savedFav = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(savedFav);
  }, []);

  // Konversi
  useEffect(() => {
    const savedUnit = localStorage.getItem("unit");
    if (savedUnit) setUnit(savedUnit);
  }, []);

  useEffect(() => {
    localStorage.setItem("unit", unit);
  }, [unit]);

  useEffect(() => {
    if (weather) {
      fetchWeather(weather.name);
    }
  }, [unit]);

  async function fetchWeather(query) {
    if (!query) return;

    setLoading(true);
    setError("");

    try {
      // CURRENT WEATHER
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${API_KEY}&units=${unit}`
      );
      const data = await res.json();

      // FORECAST
      const resForecast = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${query}&appid=${API_KEY}&units=${unit}`
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
  async function detectLocation() {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;

      setLoading(true);
      setError("");

      try {
        // CURRENT WEATHER
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=${unit}`
        );
        const data = await res.json();

        // 🔥 TAMBAHAN: FORECAST
        const resForecast = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=${unit}`
        );
        const forecastData = await resForecast.json();

        setWeather(data);
        setForecast(forecastData.list);

      } catch {
        setError("Gagal mengambil lokasi");
      }

      setLoading(false);
    });
  }

  function getBackgroundClass(weather) {
    if (!weather) return "default";

    const main = weather.weather[0].main;

    switch (main) {
      case "Clear":
        return "sunny";
      case "Clouds":
        return "cloudy";
      case "Rain":
      case "Drizzle":
        return "rainy";
      case "Thunderstorm":
        return "storm";
      case "Snow":
        return "snow";
      default:
        return "default";
    }
  }

  function isDaytime(weather) {
    if (!weather) return true;

    const now = Date.now() / 1000; // convert ke detik
    const sunrise = weather.sys.sunrise;
    const sunset = weather.sys.sunset;

    return now >= sunrise && now < sunset;
  }

  function toggleFavorite(cityName) {
    setFavorites((prev) => {
      if (prev.includes(cityName)) {
        return prev.filter((c) => c !== cityName);
      } else {
        return [cityName, ...prev];
      }
    });
  }

  return (
    <div className={`app 
      ${darkMode ? "dark" : ""} 
      ${getBackgroundClass(weather)} 
      ${isDaytime(weather) ? "day" : "night"}
    `}>
      <h1>Weather App</h1>
      {/* CREDIT */}
      <p className="credit">MBB</p>
      {/* DARK MODE */}
      <button onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? "Light Mode" : "Dark Mode"}
      </button>

      <button onClick={() => setUnit(unit === "metric" ? "imperial" : "metric")}>
        {unit === "metric" ? "°C" : "°F"}
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

      {favorites.length > 0 && (
        <div className="favorites">
          <p>⭐ Favorite:</p>
          {favorites.map((city, i) => (
            <button key={i} onClick={() => fetchWeather(city)}>
              {city}
            </button>
          ))}
        </div>
      )}

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

      <p className="last-update">Last update: {new Date().toLocaleTimeString()}</p>

      {weather && (
        <div ref={weatherRef} className="fade-in">
          <WeatherCard
            data={weather}
            isDay={isDaytime(weather)}
            isFav={favorites.includes(weather.name)}
            onToggleFav={() => toggleFavorite(weather.name)}
            unit={unit}
          />
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
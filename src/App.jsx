import React, { useEffect, useState, useRef } from "react";
import WeatherCard from "./WeatherCard";
import "./styles.css";
import Forecast from "./Forecast";
import { Analytics } from '@vercel/analytics/react';
import useWeather from "./hooks/useWeather";

//const API_KEY = import.meta.env.VITE_API_KEY;

export default function App() {
  const [city, setCity] = useState("");
  const [history, setHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [lastCity, setLastCity] = useState("");
  const [favorites, setFavorites] = useState([]);
  const {
    weather,
    forecast,
    loading,
    error,
    unit,
    setUnit,
    fetchWeather,
    detectLocation
  } = useWeather();

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

  useEffect(() => {
    if (weather && weather.name) {
      setHistory((prev) => {
        const filtered = prev.filter((c) => c !== weather.name);
        return [weather.name, ...filtered].slice(0, 5);
      });
    }
  }, [weather]);

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
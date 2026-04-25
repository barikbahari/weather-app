import { useState, useEffect } from "react";

const API_KEY = import.meta.env.VITE_API_KEY;

export default function useWeather() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unit, setUnit] = useState("metric");

  // load unit dari localStorage
  useEffect(() => {
    const savedUnit = localStorage.getItem("unit");
    if (savedUnit) setUnit(savedUnit);
  }, []);

  // simpan unit
  useEffect(() => {
    localStorage.setItem("unit", unit);
  }, [unit]);

  async function fetchWeather(query) {
    if (!query) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${API_KEY}&units=${unit}`
      );
      const data = await res.json();

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
      }
    } catch {
      setError("Terjadi error");
    }

    setLoading(false);
  }

  async function detectLocation() {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;

      setLoading(true);
      setError("");

      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=${unit}`
        );
        const data = await res.json();

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

  // refetch saat unit berubah
  useEffect(() => {
    if (weather) {
      fetchWeather(weather.name);
    }
  }, [unit]);

  return {
    weather,
    forecast,
    loading,
    error,
    unit,
    setUnit,
    fetchWeather,
    detectLocation,
  };
}
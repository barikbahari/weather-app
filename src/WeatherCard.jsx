export default function WeatherCard({ data, isDay, isFav, onToggleFav, unit }) {
  const { name, main, weather } = data;

  const icon = weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

  return (
    <div className="weather-card">
       <h2>
        {name}
        <button onClick={onToggleFav} style={{ marginLeft: 10 }}>
          {isFav ? "⭐" : "☆"}
        </button>
      </h2>

      <p>
        {isDay ? "🌞 Day" : "🌙 Night"}
      </p>

      <img src={iconUrl} alt="weather icon" />

      <div className="temp">
        {Math.round(main.temp)}°{unit === "metric" ? "C" : "F"}
      </div>

      <p>{weather[0].main}</p>

      <p className="small">
        {weather[0].description}
      </p>

      <p className="small">
        Humidity: {main.humidity}%
      </p>
    </div>
  );
}
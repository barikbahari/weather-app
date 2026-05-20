export default function WeatherCard({ data, isDay, isFav, onToggleFav, unit, aqi }) {
  const { name, main, weather } = data;

  const icon = weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;
  const progress = (aqi?.main?.aqi / 5) * 100;

  function getAqiLabel(value) {
    switch (value) {
      case 1: return "Good";
      case 2: return "Fair";
      case 3: return "Moderate";
      case 4: return "Poor";
      case 5: return "Very Poor";
      default: return "";
    }
  }

  function getAqiColor(aqi) {
    switch (aqi) {
      case 1:
        return "#22c55e"; // hijau
      case 2:
        return "#eab308"; // kuning
      case 3:
        return "#f97316"; // orange
      case 4:
        return "#ef4444"; // merah
      case 5:
        return "#7f1d1d"; // merah gelap
      default:
        return "#94a3b8";
    }
  }

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

      {aqi && (
        <div className="aqi">
          <p>
            🌫️ AQI: {aqi?.main?.aqi} ({getAqiLabel(aqi?.main?.aqi)})
          </p>

          <div className="aqi-bar">
            <div
              className="aqi-indicator"
              style={{
                left: `${progress}%`
              }}
            ></div>
          </div>

          <p className="aqi-desc">
            {aqi?.main?.aqi <= 2
              ? "Udara cukup baik"
              : "Disarankan mengurangi aktivitas luar ruangan"}
          </p>

          <div className="aqi-detail">
            <p>PM2.5: {aqi?.components?.pm2_5}</p>
            <p>PM10: {aqi?.components?.pm10}</p>
            <p>NO₂: {aqi?.components?.no2}</p>
          </div>
        </div>
      )}
    </div>
  );
}
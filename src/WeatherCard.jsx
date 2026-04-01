export default function WeatherCard({ data }) {
  const { name, main, weather } = data;

  const icon = weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

  return (
    <div className="weather-card">
      <h2>{name}</h2>

      <img src={iconUrl} alt="weather icon" />

      <div className="temp">
        {Math.round(main.temp)}°C
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
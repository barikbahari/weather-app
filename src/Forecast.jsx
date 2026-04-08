export default function Forecast({ data }) {
  const daily = data;

  return (
    <div className="forecast">
      {daily.map((item, i) => {
        const date = new Date(item.dt_txt);

        return (
          <div key={i} className="forecast-item">
            <p>{date.toLocaleDateString("id-ID", { weekday: "short" })}</p>

            <img
              src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
            />

            <p>{Math.round(item.main.temp)}°C</p>
          </div>
        );
      })}
    </div>
  );
}
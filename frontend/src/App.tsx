import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

interface WeatherForecast {
  date: string;
  temperatureC: number;
  temperatureF: number;
  summary: string | null;
}

function App() {
  const [forecasts, setForecasts] = useState<WeatherForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get<WeatherForecast[]>('/api/weatherforecast')
      .then((res) => setForecasts(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1>ASP.NET Core + React</h1>
      <p>
        If you see weather data below, the frontend is successfully talking to
        the backend API.
      </p>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {!loading && !error && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Date', 'Temp (C)', 'Temp (F)', 'Summary'].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: 'left',
                    borderBottom: '2px solid #ddd',
                    padding: '8px',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {forecasts.map((f) => (
              <tr key={f.date}>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{f.date}</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{f.temperatureC}</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{f.temperatureF}</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{f.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;

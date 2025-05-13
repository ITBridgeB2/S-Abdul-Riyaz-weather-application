import './App.css';
import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [searchCity, setSearchCity] = useState('Bengaluru');  // Default city set to Bangalore
  const [weatherData, setWeatherData] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [bgImage, setBgImage] = useState('');

  const API_KEY = '39d0aa685efe2a24f1c1664c6f845cb4';

  useEffect(() => {
    fetchWeather('Bengaluru');  // Fetch weather for Bangalore by default
    fetchSearchHistory();
  }, []);

  useEffect(() => {
    if (weatherData) {
      updateBackground(weatherData.condition);
    }
  }, [weatherData]);

  const updateBackground = (condition) => {
    let image = '';
    condition = condition.toLowerCase();

    if (condition.includes('cloud')) image = 'cloudy.jpg';
    else if (condition.includes('rain')) image = 'rainy.jpg';
    else if (condition.includes('clear')) image = 'clear.webp';
    else if (condition.includes('sun')) image = 'sunny.webp';
    else if (condition.includes('storm')) image = 'storm.jpg';
    else if (condition.includes('snow')) image = 'snow.jpg';
    else image = 'default.jpg';

    setBgImage(require(`./assets/${image}`));
  };

  const fetchWeather = async (city) => {
    try {
      const res = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      const data = res.data;
      setWeatherData({
        city: data.name,
        temperature: data.main.temp,
        humidity: data.main.humidity,
        wind: data.wind.speed,
        condition: data.weather[0].description,
      });

      await axios.post('http://localhost:5000/search', { city: data.name });
      fetchSearchHistory();
    } catch {
      alert('City not found');
    }
  };

  const fetchSearchHistory = async () => {
    const res = await axios.get('http://localhost:5000/history');
    setSearchHistory(res.data || []);
  };

  const handleSearch = () => {
    if (!searchCity) return;
    fetchWeather(searchCity);
  };

  const handleClearHistory = async () => {
  const confirmClear = window.confirm("Are you sure you want to delete all search history?");
  if (!confirmClear) return;

  try {
    await axios.delete("http://localhost:5000/api/history");
    setSearchHistory([]);
  } catch (err) {
    console.error("Failed to clear history", err);
  }
};


  return (
    <div className="App" style={{ backgroundImage: `url(${bgImage})` }}>
      <h1>Weather Dashboard</h1>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Enter city name"
          value={searchCity}
          onChange={(e) => setSearchCity(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      <div className="cards">
        <div className="card">
          <h2>Search Result</h2>
          {weatherData ? (
            <>
              <p><strong>City:</strong> {weatherData.city}</p>
              <p><strong>Temperature:</strong> {weatherData.temperature} °C</p>
              <p><strong>Humidity:</strong> {weatherData.humidity}%</p>
              <p><strong>Wind Speed:</strong> {weatherData.wind} km/h</p>
              <p><strong>Condition:</strong> {weatherData.condition}</p>
            </>
          ) : (
            <p>No data yet.</p>
          )}
        </div>

        <div className='card'>
          <div className="historyHeader">
            <h3>Search History</h3>
            <button className='clearBtn' onClick={handleClearHistory}>Clear All History</button>
          </div>
          <ul>
            {searchHistory.length > 0 ? (
              searchHistory.map((entry, index) => (
                <li key={index}>{entry.city} - {new Date(entry.timestamp).toLocaleString()}</li>
              ))
            ) : (
              <p>No history available.</p>
            )}
          </ul>
        </div>

      </div>
    </div>
  );
}

export default App;

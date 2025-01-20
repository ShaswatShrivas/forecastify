import { useEffect, useState } from 'react'
import axios from 'axios'

function App() {
  const [weather, setWeather] = useState(null)
  const [error, setError] = useState(null)
  const [searchCity, setSearchCity] = useState('')

  useEffect(() => {
    const fetchIpAndWeather = async () => {
      try {
        const ipAddress = await window.electron.getIpAddress()
        if (ipAddress) {
          const locationResponse = await axios.get(
            `http://ipinfo.io/${ipAddress}/json?token=${import.meta.env.RENDERER_VITE_IPINFO_KEY}`
          )
          const city = locationResponse.data.city || 'Kolkata'
          await fetchWeather(city)
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to fetch data. Please try again later.')
      }
    }

    fetchIpAndWeather()
  }, [])

  const fetchWeather = async (city) => {
    try {
      const weatherResponse = await axios.get(
        `https://api.weatherapi.com/v1/current.json?key=${import.meta.env.RENDERER_VITE_API_KEY}&q=${city}`
      )
      setWeather(weatherResponse.data)
      setError(null)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to fetch weather. Please try again later.')
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchCity.trim()) {
      fetchWeather(searchCity)
    }
  }

  useEffect(() => {
    const closeButton = document.getElementById('close')
    const minimizeButton = document.getElementById('minimize')
    const maximizeButton = document.getElementById('maximize')

    closeButton.addEventListener('click', () => {
      window.electron.ipcRenderer.send('close-window')
    })

    minimizeButton.addEventListener('click', () => {
      window.electron.ipcRenderer.send('minimize-window')
    })

    maximizeButton.addEventListener('click', () => {
      window.electron.ipcRenderer.send('maximize-window')
    })

    return () => {
      closeButton.removeEventListener('click', () => {
        window.electron.ipcRenderer.send('close-window')
      })
      minimizeButton.removeEventListener('click', () => {
        window.electron.ipcRenderer.send('minimize-window')
      })
      maximizeButton.removeEventListener('click', () => {
        window.electron.ipcRenderer.send('maximize-window')
      })
    }
  }, [])

  return (
    <div className="App">
      <video autoPlay loop muted id="video">
        <source
          src="https://cdn.pixabay.com/video/2021/02/10/64767-510850921_large.mp4"
          type="video/mp4"
        />
      </video>
      <div className="content">
        <header>
          <button id="minimize" title="Minimize"></button>
          <button id="maximize" title="Maximize"></button>
          <button id="close" title="Close"></button>
        </header>
        <main>
          <h1 className="title">Forcastǐfy</h1>
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              placeholder="Enter city name"
              className="search-input"
            />
            <button type="submit" className="search-button">
              Search
            </button>
          </form>
          {error ? (
            <p className="error">{error}</p>
          ) : weather ? (
            <div className="weather-info">
              <div className="location">
                <h2>{weather.location.name}</h2>
                <h3>
                  {weather.location.region}, {weather.location.country}
                </h3>
              </div>
              <div className="weather-details">
                <div className="temperature">
                  <span>{Math.round(weather.current.temp_c)}°C</span>
                </div>
                <div className="condition">
                  <img
                    src={weather.current.condition.icon || '/placeholder.svg'}
                    alt={weather.current.condition.text}
                  />
                  <p>{weather.current.condition.text}</p>
                </div>
              </div>
              <div className="additional-info">
                <div className="info-item">
                  <span className="info-label">Humidity</span>
                  <span className="info-value">{weather.current.humidity}%</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Wind</span>
                  <span className="info-value">{weather.current.wind_kph} km/h</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Feels Like</span>
                  <span className="info-value">{Math.round(weather.current.feelslike_c)}°C</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="loading">Loading...</p>
          )}
        </main>
      </div>
    </div>
  )
}

export default App

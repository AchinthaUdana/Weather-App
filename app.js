const API_KEY = "API_KEY";

// DOM Elements
const searchBar = document.querySelector(".search-bar");
const searchBtn = document.querySelector(".search-btn");
const locationBtn = document.querySelector(".location-btn");
const cityName = document.querySelector(".city-name");
const dateElement = document.querySelector(".date");
const temperature = document.querySelector(".temperature");
const weatherIcon = document.querySelector(".weather-icon i");
const weatherDescription = document.querySelector(".weather-description");
const feelsLike = document.querySelector(".feels-like");
const humidity = document.querySelector(".humidity");
const wind = document.querySelector(".wind");
const pressure = document.querySelector(".pressure");
const forecastDays = document.querySelector(".forecast-days");

// Current date
const currentDate = new Date();
const options = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
};
dateElement.textContent = currentDate.toLocaleDateString("en-US", options);

const weatherIcons = {
  "01d": "fas fa-sun",
  "01n": "fas fa-moon",
  "02d": "fas fa-cloud-sun",
  "02n": "fas fa-cloud-moon",
  "03d": "fas fa-cloud",
  "03n": "fas fa-cloud",
  "04d": "fas fa-cloud-meatball",
  "04n": "fas fa-cloud-meatball",
  "09d": "fas fa-cloud-rain",
  "09n": "fas fa-cloud-rain",
  "10d": "fas fa-cloud-sun-rain",
  "10n": "fas fa-cloud-moon-rain",
  "11d": "fas fa-bolt",
  "11n": "fas fa-bolt",
  "13d": "far fa-snowflake",
  "13n": "far fa-snowflake",
  "50d": "fas fa-smog",
  "50n": "fas fa-smog",
};

async function fetchWeather(city) {
  try {
    const currentResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
    );

    if (!currentResponse.ok) {
      throw new Error("City not found");
    }

    const currentData = await currentResponse.json();

    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
    );
    const forecastData = await forecastResponse.json();

    displayWeather(currentData);
    displayForecast(forecastData);
  } catch (error) {
    alert(error.message);
  }
}

function displayWeather(data) {
  cityName.textContent = data.name + ", " + data.sys.country;
  temperature.textContent = Math.round(data.main.temp) + "°C";
  weatherIcon.className =
    weatherIcons[data.weather[0].icon] || "fas fa-question";
  weatherDescription.textContent = data.weather[0].description;
  feelsLike.textContent = Math.round(data.main.feels_like) + "°C";
  humidity.textContent = data.main.humidity + "%";
  wind.textContent = Math.round(data.wind.speed * 3.6) + " km/h";
  pressure.textContent = data.main.pressure + " hPa";
}

function displayForecast(data) {
  forecastDays.innerHTML = "";

  const dailyForecasts = data.list
    .filter((forecast) => {
      return forecast.dt_txt.includes("12:00:00");
    })
    .slice(0, 5);

  dailyForecasts.forEach((forecast) => {
    const forecastDate = new Date(forecast.dt * 1000);
    const dayOptions = { weekday: "short", month: "short", day: "numeric" };

    const forecastDay = document.createElement("div");
    forecastDay.className = "forecast-day";

    forecastDay.innerHTML = `
            <div class="forecast-date">${forecastDate.toLocaleDateString(
              "en-US",
              dayOptions
            )}</div>
            <div class="forecast-icon"><i class="${
              weatherIcons[forecast.weather[0].icon] || "fas fa-question"
            }"></i></div>
            <div class="forecast-description">${
              forecast.weather[0].description
            }</div>
            <div class="forecast-temp">
                <span class="forecast-temp-max">${Math.round(
                  forecast.main.temp_max
                )}°</span>
                <span class="forecast-temp-min">${Math.round(
                  forecast.main.temp_min
                )}°</span>
            </div>
        `;

    forecastDays.appendChild(forecastDay);
  });
}

function getWeatherByLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const currentResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
          );
          const currentData = await currentResponse.json();

          const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
          );
          const forecastData = await forecastResponse.json();

          displayWeather(currentData);
          displayForecast(forecastData);
          searchBar.value = currentData.name;
        } catch (error) {
          alert("Error fetching weather data");
        }
      },
      (error) => {
        alert(
          "Geolocation access denied. Please enable it to use this feature."
        );
      }
    );
  } else {
    alert("Geolocation is not supported by your browser");
  }
}

searchBtn.addEventListener("click", () => {
  if (searchBar.value.trim()) {
    fetchWeather(searchBar.value.trim());
  }
});

locationBtn.addEventListener("click", getWeatherByLocation);

searchBar.addEventListener("keyup", (e) => {
  if (e.key === "Enter" && searchBar.value.trim()) {
    fetchWeather(searchBar.value.trim());
  }
});

fetchWeather("London");

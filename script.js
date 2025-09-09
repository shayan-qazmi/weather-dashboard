const API_KEY = "ec1f67e92b6a86f12e2dbb86ae22e508"; // <- Replace with your API key

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const weatherContainer = document.getElementById("weatherContainer");
const forecastContainer = document.getElementById("forecastContainer");
const loading = document.getElementById("loading");
const errorBox = document.getElementById("error");

// Fetch weather data
async function fetchWeather(city) {
  try {
    loading.classList.remove("hidden");
    errorBox.classList.add("hidden");
    weatherContainer.innerHTML = "";
    forecastContainer.innerHTML = "";
    document.body.className = "default";

    // Current weather
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    if (!res.ok) throw new Error("City not found");
    const data = await res.json();

    renderWeather(data);
    updateBackground(data.weather[0].main);

    // Forecast (3-day)
    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
    );
    const forecastData = await forecastRes.json();
    renderForecast(forecastData);
  } catch (err) {
    errorBox.textContent = err.message.includes("City") 
      ? "❌ City not found. Try again." 
      : "⚠️ Network error. Please retry.";
    errorBox.classList.remove("hidden");
  } finally {
    loading.classList.add("hidden");
  }
}

// Render current weather
function renderWeather(data) {
  const cityName = data.name.charAt(0).toUpperCase() + data.name.slice(1);

  const html = `
    <h2>${cityName}, ${data.sys.country}</h2>
    <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}">
    <p><strong>${data.main.temp.toFixed(1)}°C</strong></p>
    <p>${data.weather[0].main}</p>
  `;
  weatherContainer.innerHTML = html;
  weatherContainer.style.opacity = "1";
}

// Render 3-day forecast
function renderForecast(data) {
  forecastContainer.innerHTML = "";

  // Group by day
  const daily = {};
  data.list.forEach((item) => {
    const date = item.dt_txt.split(" ")[0];
    if (!daily[date]) daily[date] = item;
  });

  const days = Object.keys(daily).slice(1, 4); // next 3 days
  days.forEach((day, index) => {
    const item = daily[day];
    const card = document.createElement("div");
    card.classList.add("forecast-card");
    card.style.animationDelay = `${0.2 * index}s`; // staggered animation
    card.innerHTML = `
      <h4>${new Date(day).toLocaleDateString("en-US", { weekday: "short" })}</h4>
      <img src="http://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="">
      <p>${item.main.temp.toFixed(1)}°C</p>
      <p>${item.weather[0].main}</p>
    `;
    forecastContainer.appendChild(card);
    card.style.opacity = "1";
  });
}

// Dynamic background
function updateBackground(condition) {
  const weather = condition.toLowerCase();
  if (weather.includes("cloud")) document.body.className = "cloudy";
  else if (weather.includes("rain") || weather.includes("drizzle")) document.body.className = "rainy";
  else if (weather.includes("snow")) document.body.className = "snowy";
  else if (weather.includes("clear")) document.body.className = "sunny";
  else document.body.className = "default";
}

// Event listeners
searchBtn.addEventListener("click", () => {
  if (cityInput.value.trim()) {
    fetchWeather(cityInput.value.trim());
  }
});

cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && cityInput.value.trim()) {
    fetchWeather(cityInput.value.trim());
  }
});

// Auto-detect location
window.onload = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
      );
      const data = await res.json();
      renderWeather(data);
      updateBackground(data.weather[0].main);

      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
      );
      const forecastData = await forecastRes.json();
      renderForecast(forecastData);
    });
  }
};

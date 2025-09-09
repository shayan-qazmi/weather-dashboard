const API_KEY = "ec1f67e92b6a86f12e2dbb86ae22e508"; 

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const weatherContainer = document.getElementById("weatherContainer");
const forecastContainer = document.getElementById("forecastContainer");
const loading = document.getElementById("loading");
const errorBox = document.getElementById("error");

const themeToggle = document.getElementById("themeToggle");
const unitToggle = document.getElementById("unitToggle");
const extraDetails = document.getElementById("extraDetails");
const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const pressure = document.getElementById("pressure");
const homeBtn = document.getElementById("homeBtn");
const weatherEffects = document.getElementById("weatherEffects");

let useFahrenheit = false;

// Clear previous effects
function clearEffects() {
  weatherEffects.innerHTML = "";
}

// Generate dynamic clouds
function createClouds(count = 5) {
  for (let i = 0; i < count; i++) {
    const cloud = document.createElement("div");
    cloud.classList.add("cloud");
    cloud.style.top = `${Math.random() * 40 + 20}px`;
    cloud.style.animationDuration = `${50 + Math.random() * 40}s`;
    cloud.style.opacity = 0.5 + Math.random() * 0.3;
    weatherEffects.appendChild(cloud);
  }
}

// Generate sun
function createSun() {
  const sun = document.createElement("div");
  sun.classList.add("sun");
  weatherEffects.appendChild(sun);
}

// Generate rain
function createRain(count = 100) {
  for (let i = 0; i < count; i++) {
    const drop = document.createElement("div");
    drop.classList.add("rain");
    drop.style.left = `${Math.random() * 100}%`;
    drop.style.animationDelay = `${Math.random()}s`;
    drop.style.animationDuration = `${0.5 + Math.random()}s`;
    weatherEffects.appendChild(drop);
  }
}

// Generate snow
function createSnow(count = 50) {
  for (let i = 0; i < count; i++) {
    const snow = document.createElement("div");
    snow.classList.add("snow");
    snow.style.left = `${Math.random() * 100}%`;
    snow.style.animationDelay = `${Math.random()}s`;
    snow.style.animationDuration = `${2 + Math.random() * 3}s`;
    weatherEffects.appendChild(snow);
  }
}

// Update background and effects
function updateBackground(condition) {
  clearEffects();
  const weather = condition.toLowerCase();
  document.body.className = ""; // reset classes

  if (weather.includes("cloud")) {
    document.body.classList.add("cloudy");
    createClouds();
  } else if (weather.includes("rain") || weather.includes("drizzle")) {
    document.body.classList.add("rainy");
    createRain();
    createClouds(3);
  } else if (weather.includes("snow")) {
    document.body.classList.add("snowy");
    createSnow();
    createClouds(2);
  } else if (weather.includes("clear")) {
    document.body.classList.add("sunny");
    createSun();
  } else {
    document.body.classList.add("default");
  }

  // Night auto dark mode
  const hour = new Date().getHours();
  if (hour >= 19 || hour < 6) document.body.classList.add("dark-mode");
}

// Render weather and other data
async function fetchWeather(city) {
  try {
    loading.classList.remove("hidden");
    errorBox.classList.add("hidden");
    weatherContainer.innerHTML = "";
    forecastContainer.innerHTML = "";
    extraDetails.classList.add("hidden");
    document.body.className = "default";

    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    if (!res.ok) throw new Error("City not found");
    const data = await res.json();

    renderWeather(data);
    renderExtraDetails(data);
    updateBackground(data.weather[0].main);

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

function renderWeather(data) {
  const cityName = data.name.charAt(0).toUpperCase() + data.name.slice(1);
  let temp = data.main.temp;
  if (useFahrenheit) temp = (temp * 9) / 5 + 32;

  weatherContainer.innerHTML = `
    <h2>${cityName}, ${data.sys.country}</h2>
    <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}">
    <p class="temperature"><strong>${temp.toFixed(1)}°${useFahrenheit ? "F" : "C"}</strong></p>
    <p>${data.weather[0].main}</p>
  `;
}

function renderExtraDetails(data) {
  let feels = data.main.feels_like;
  if (useFahrenheit) feels = (feels * 9) / 5 + 32;

  feelsLike.textContent = `Feels like: ${feels.toFixed(1)}°${useFahrenheit ? "F" : "C"}`;
  humidity.textContent = `Humidity: ${data.main.humidity}%`;
  wind.textContent = `Wind: ${data.wind.speed} m/s`;
  pressure.textContent = `Pressure: ${data.main.pressure} hPa`;

  extraDetails.classList.remove("hidden");
}

function renderForecast(data) {
  forecastContainer.innerHTML = "";
  const daily = {};
  data.list.forEach(item => {
    const date = item.dt_txt.split(" ")[0];
    if (!daily[date]) daily[date] = item;
  });

  const days = Object.keys(daily).slice(1, 4);
  days.forEach((day, index) => {
    const item = daily[day];
    let temp = item.main.temp;
    if (useFahrenheit) temp = (temp * 9) / 5 + 32;

    const card = document.createElement("div");
    card.classList.add("forecast-card");
    card.style.animationDelay = `${0.2 * index}s`;
    card.innerHTML = `
      <h4>${new Date(day).toLocaleDateString("en-US", { weekday: "short" })}</h4>
      <img src="http://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="">
      <p class="temperature">${temp.toFixed(1)}°${useFahrenheit ? "F" : "C"}</p>
      <p>${item.weather[0].main}</p>
    `;
    forecastContainer.appendChild(card);
    card.style.opacity = "1";
  });
}

// Event listeners
searchBtn.addEventListener("click", () => {
  if (cityInput.value.trim()) fetchWeather(cityInput.value.trim());
});

cityInput.addEventListener("keypress", e => {
  if (e.key === "Enter" && cityInput.value.trim()) fetchWeather(cityInput.value.trim());
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  themeToggle.textContent = document.body.classList.contains("dark-mode") ? "☀️" : "🌙";
});

unitToggle.addEventListener("change", () => {
  useFahrenheit = unitToggle.checked;
  if (weatherContainer.innerHTML) {
    const city = weatherContainer.querySelector("h2").textContent.split(",")[0];
    fetchWeather(city);
  }
});

homeBtn.addEventListener("click", () => {
  cityInput.value = "";
  weatherContainer.innerHTML = "";
  forecastContainer.innerHTML = "";
  extraDetails.classList.add("hidden");
  errorBox.classList.add("hidden");
  clearEffects();
  document.body.className = "default";
});

// Auto-detect location
window.onload = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async pos => {
      const { latitude, longitude } = pos.coords;
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
      );
      const data = await res.json();
      renderWeather(data);
      renderExtraDetails(data);
      updateBackground(data.weather[0].main);

      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
      );
      const forecastData = await forecastRes.json();
      renderForecast(forecastData);
    });
  }
};

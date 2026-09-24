// ใส่ API Key ที่สมัครฟรีจาก https://openweathermap.org/api
const apiKey = 'YOUR_API_KEY';
const baseUrl = 'https://api.openweathermap.org/data/2.5';

const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const loading = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const weatherResult = document.getElementById('weatherResult');
const forecastSection = document.getElementById('forecastSection');
const forecastList = document.getElementById('forecastList');
const multiResult = document.getElementById('multiResult');

// ---------- Fetch ----------

async function fetchJson(endpoint, city) {
    const url = `${baseUrl}/${endpoint}?q=${encodeURIComponent(city)}&units=metric&lang=th&appid=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) {
        if (response.status === 404) throw new Error(`ไม่พบเมือง "${city}"`);
        if (response.status === 401) throw new Error('API Key ไม่ถูกต้อง หรือยังไม่ Active (อาจใช้เวลาสักครู่)');
        throw new Error(`เรียก API ไม่สำเร็จ (HTTP ${response.status})`);
    }
    return await response.json();
}

async function fetchWeather(city) {
    return fetchJson('weather', city);
}

async function fetchForecast(city) {
    return fetchJson('forecast', city);
}

// ---------- Display ----------

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function iconUrl(code) {
    return `https://openweathermap.org/img/wn/${code}@2x.png`;
}

function weatherCardHtml(data) {
    const temp = Math.round(data.main.temp);
    const humidity = data.main.humidity;
    const pressure = data.main.pressure;
    const wind = data.wind.speed;
    return `
        <div class="weather-card">
            <div class="icon"><img src="${iconUrl(data.weather[0].icon)}" alt="weather icon"></div>
            <div class="info">
                <h2>${temp}°C</h2>
                <p>${escapeHtml(data.name)}, ${escapeHtml(data.sys.country)}</p>
                <p>${escapeHtml(data.weather[0].description)}</p>
            </div>
            <div class="details">
                <p>💧 ความชื้น<br><b>${humidity}%</b></p>
                <p>💨 ความเร็วลม<br><b>${wind} m/s</b></p>
                <p>🌡 ความกดอากาศ<br><b>${pressure} hPa</b></p>
            </div>
        </div>`;
}

function displayWeather(data) {
    weatherResult.innerHTML = weatherCardHtml(data);
    weatherResult.classList.remove('hidden');
}

// รวมข้อมูลพยากรณ์ทุก 3 ชั่วโมงให้เป็นรายวัน (สูงสุด/ต่ำสุด)
function groupForecastByDay(forecast) {
    const days = {};
    forecast.list.forEach((item) => {
        const date = item.dt_txt.split(' ')[0];
        if (!days[date]) {
            days[date] = { date, max: -Infinity, min: Infinity, icon: item.weather[0].icon };
        }
        days[date].max = Math.max(days[date].max, item.main.temp_max);
        days[date].min = Math.min(days[date].min, item.main.temp_min);
        if (item.dt_txt.includes('12:00:00')) days[date].icon = item.weather[0].icon;
    });
    return Object.values(days).slice(0, 5);
}

function displayForecast(forecast) {
    const days = groupForecastByDay(forecast);
    forecastList.innerHTML = days.map((day) => {
        const label = new Date(day.date).toLocaleDateString('th-TH', { weekday: 'short' });
        return `
            <div class="forecast-day">
                <div>${label}</div>
                <img src="${iconUrl(day.icon)}" alt="">
                <div class="max">${Math.round(day.max)}°C</div>
                <div class="min">${Math.round(day.min)}°C</div>
            </div>`;
    }).join('');
    drawChart(days);
    forecastSection.classList.remove('hidden');
}

// กราฟแท่งอุณหภูมิสูงสุด/ต่ำสุด วาดด้วย Canvas (ไม่ใช้ไลบรารี)
function drawChart(days) {
    const canvas = document.getElementById('tempChart');
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const pad = { top: 20, right: 10, bottom: 30, left: 35 };
    ctx.clearRect(0, 0, w, h);

    const maxTemp = Math.max(40, ...days.map((d) => Math.ceil(d.max / 10) * 10));
    const plotH = h - pad.top - pad.bottom;
    const plotW = w - pad.left - pad.right;
    const yOf = (t) => pad.top + plotH - (Math.max(t, 0) / maxTemp) * plotH;

    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#666';
    ctx.strokeStyle = '#e5e5e5';
    for (let t = 0; t <= maxTemp; t += 10) {
        ctx.beginPath();
        ctx.moveTo(pad.left, yOf(t));
        ctx.lineTo(w - pad.right, yOf(t));
        ctx.stroke();
        ctx.fillText(t, 5, yOf(t) + 4);
    }

    const groupW = plotW / days.length;
    const barW = groupW / 4;
    days.forEach((day, i) => {
        const x = pad.left + i * groupW + groupW / 2 - barW;
        ctx.fillStyle = '#ff9f43';
        ctx.fillRect(x, yOf(day.max), barW, yOf(0) - yOf(day.max));
        ctx.fillStyle = '#1a73e8';
        ctx.fillRect(x + barW, yOf(day.min), barW, yOf(0) - yOf(day.min));
        ctx.fillStyle = '#333';
        const label = new Date(day.date).toLocaleDateString('th-TH', { weekday: 'short' });
        ctx.fillText(label, x + barW / 2, h - 10);
    });

    ctx.fillStyle = '#ff9f43';
    ctx.fillRect(w - 130, 4, 10, 10);
    ctx.fillStyle = '#333';
    ctx.fillText('สูงสุด', w - 116, 13);
    ctx.fillStyle = '#1a73e8';
    ctx.fillRect(w - 70, 4, 10, 10);
    ctx.fillStyle = '#333';
    ctx.fillText('ต่ำสุด', w - 56, 13);
}

function resetView() {
    errorDiv.classList.add('hidden');
    weatherResult.classList.add('hidden');
    forecastSection.classList.add('hidden');
    multiResult.classList.add('hidden');
}

// ---------- Load ----------

async function loadWeather(city) {
    // ดึงสภาพอากาศปัจจุบันและพยากรณ์พร้อมกัน
    const [weather, forecast] = await Promise.all([fetchWeather(city), fetchForecast(city)]);
    displayWeather(weather);
    displayForecast(forecast);
}

// Optional: เรียกหลายเมืองพร้อมกันด้วย Promise.all
async function loadMultipleCities(cities) {
    const results = await Promise.all(cities.map((city) => fetchWeather(city)));
    multiResult.innerHTML = results.map(weatherCardHtml).join('');
    multiResult.classList.remove('hidden');
}

async function handleSearch() {
    if (apiKey === 'YOUR_API_KEY') {
        errorDiv.textContent = '❌ ยังไม่ได้ใส่ API Key ในไฟล์ app.js (บรรทัดแรก)';
        errorDiv.classList.remove('hidden');
        return;
    }

    const cities = cityInput.value.split(',').map((c) => c.trim()).filter(Boolean);
    if (cities.length === 0) {
        errorDiv.textContent = 'กรุณาพิมพ์ชื่อเมือง';
        errorDiv.classList.remove('hidden');
        return;
    }

    resetView();
    loading.classList.remove('hidden');
    searchBtn.disabled = true;
    try {
        if (cities.length === 1) {
            await loadWeather(cities[0]);
        } else {
            await loadMultipleCities(cities);
        }
    } catch (error) {
        errorDiv.textContent = '❌ ' + (error instanceof TypeError
            ? 'ไม่สามารถโหลดข้อมูลได้ กรุณาตรวจสอบ Internet'
            : error.message);
        errorDiv.classList.remove('hidden');
    } finally {
        loading.classList.add('hidden');
        searchBtn.disabled = false;
    }
}

searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') handleSearch();
});

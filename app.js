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

async function getData(type, city) {
    const url = baseUrl + '/' + type + '?q=' + encodeURIComponent(city) + '&units=metric&lang=th&appid=' + apiKey;
    const response = await fetch(url);

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('ไม่พบเมือง ' + city);
        }
        if (response.status === 401) {
            throw new Error('API Key ไม่ถูกต้อง หรือยังไม่ Active');
        }
        throw new Error('เรียก API ไม่สำเร็จ (' + response.status + ')');
    }

    const data = await response.json();
    return data;
}

function makeCard(data) {
    const temp = Math.round(data.main.temp);
    const icon = 'https://openweathermap.org/img/wn/' + data.weather[0].icon + '@2x.png';

    // ใช้ textContent ตอนสร้างชื่อเมือง กันข้อมูลแปลกๆ เข้ามาเป็น HTML
    const cityText = document.createElement('span');
    cityText.textContent = data.name + ', ' + data.sys.country;
    const descText = document.createElement('span');
    descText.textContent = data.weather[0].description;

    return `
        <div class="weather-card">
            <div class="icon"><img src="${icon}" alt="icon"></div>
            <div class="info">
                <h2>${temp}°C</h2>
                <p>${cityText.innerHTML}</p>
                <p>${descText.innerHTML}</p>
            </div>
            <div class="details">
                <p>💧 ความชื้น<br><b>${data.main.humidity}%</b></p>
                <p>💨 ความเร็วลม<br><b>${data.wind.speed} m/s</b></p>
                <p>🌡 ความกดอากาศ<br><b>${data.main.pressure} hPa</b></p>
            </div>
        </div>`;
}

function displayWeather(data) {
    weatherResult.innerHTML = makeCard(data);
    weatherResult.classList.remove('hidden');
}

function getDays(forecast) {
    const days = {};

    for (let i = 0; i < forecast.list.length; i++) {
        const item = forecast.list[i];
        const date = item.dt_txt.split(' ')[0];

        if (!days[date]) {
            days[date] = { date: date, max: item.main.temp_max, min: item.main.temp_min, icon: item.weather[0].icon };
        } else {
            if (item.main.temp_max > days[date].max) days[date].max = item.main.temp_max;
            if (item.main.temp_min < days[date].min) days[date].min = item.main.temp_min;
        }

        if (item.dt_txt.includes('12:00:00')) {
            days[date].icon = item.weather[0].icon;
        }
    }

    return Object.values(days).slice(0, 5);
}

function dayName(dateStr) {
    return new Date(dateStr).toLocaleDateString('th-TH', { weekday: 'short' });
}

function displayForecast(forecast) {
    const days = getDays(forecast);
    let html = '';

    days.forEach(function (day) {
        html += `
            <div class="forecast-day">
                <div>${dayName(day.date)}</div>
                <img src="https://openweathermap.org/img/wn/${day.icon}@2x.png" alt="">
                <div class="max">${Math.round(day.max)}°C</div>
                <div class="min">${Math.round(day.min)}°C</div>
            </div>`;
    });

    forecastList.innerHTML = html;
    drawChart(days);
    forecastSection.classList.remove('hidden');
}

function drawChart(days) {
    const canvas = document.getElementById('tempChart');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const top = 25;
    const bottom = 30;
    const left = 35;
    const maxTemp = 40;

    ctx.clearRect(0, 0, width, height);
    ctx.font = '12px sans-serif';

    // แกน y: 0, 10, 20, 30, 40
    function getY(temp) {
        if (temp < 0) temp = 0;
        return top + (height - top - bottom) * (1 - temp / maxTemp);
    }

    for (let t = 0; t <= maxTemp; t += 10) {
        ctx.strokeStyle = '#e5e5e5';
        ctx.beginPath();
        ctx.moveTo(left, getY(t));
        ctx.lineTo(width - 10, getY(t));
        ctx.stroke();
        ctx.fillStyle = '#666';
        ctx.fillText(t, 8, getY(t) + 4);
    }

    const groupWidth = (width - left - 10) / days.length;
    const barWidth = groupWidth / 4;

    days.forEach(function (day, i) {
        const x = left + i * groupWidth + groupWidth / 2 - barWidth;

        ctx.fillStyle = '#ff9f43';
        ctx.fillRect(x, getY(day.max), barWidth, getY(0) - getY(day.max));

        ctx.fillStyle = '#1a73e8';
        ctx.fillRect(x + barWidth, getY(day.min), barWidth, getY(0) - getY(day.min));

        ctx.fillStyle = '#333';
        ctx.fillText(dayName(day.date), x, height - 10);
    });

    ctx.fillStyle = '#ff9f43';
    ctx.fillRect(width - 130, 5, 10, 10);
    ctx.fillStyle = '#1a73e8';
    ctx.fillRect(width - 70, 5, 10, 10);
    ctx.fillStyle = '#333';
    ctx.fillText('สูงสุด', width - 116, 14);
    ctx.fillText('ต่ำสุด', width - 56, 14);
}

async function loadWeather(city) {
    const weather = await getData('weather', city);
    const forecast = await getData('forecast', city);
    displayWeather(weather);
    displayForecast(forecast);
}

// เรียกหลายเมืองพร้อมกัน
async function loadMultipleCities(cities) {
    const promises = cities.map(function (city) {
        return getData('weather', city);
    });
    const results = await Promise.all(promises);

    let html = '';
    results.forEach(function (data) {
        html += makeCard(data);
    });
    multiResult.innerHTML = html;
    multiResult.classList.remove('hidden');
}

function showError(message) {
    errorDiv.textContent = '❌ ' + message;
    errorDiv.classList.remove('hidden');
}

async function handleSearch() {
    errorDiv.classList.add('hidden');
    weatherResult.classList.add('hidden');
    forecastSection.classList.add('hidden');
    multiResult.classList.add('hidden');

    if (apiKey === 'YOUR_API_KEY') {
        showError('ยังไม่ได้ใส่ API Key ในไฟล์ app.js');
        return;
    }

    const cities = cityInput.value.split(',')
        .map(function (c) { return c.trim(); })
        .filter(function (c) { return c !== ''; });

    if (cities.length === 0) {
        showError('กรุณาพิมพ์ชื่อเมือง');
        return;
    }

    loading.classList.remove('hidden');
    searchBtn.disabled = true;

    try {
        if (cities.length === 1) {
            await loadWeather(cities[0]);
        } else {
            await loadMultipleCities(cities);
        }
    } catch (error) {
        console.log(error);
        if (error instanceof TypeError) {
            showError('ไม่สามารถโหลดข้อมูลได้ กรุณาตรวจสอบ Internet');
        } else {
            showError(error.message);
        }
    } finally {
        loading.classList.add('hidden');
        searchBtn.disabled = false;
    }
}

searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        handleSearch();
    }
});

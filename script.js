const apiKey = 'eed09418de64ad3cf7289ad5140a9026';
const currentweatherurl='https://api.openweathermap.org/data/2.5/weather?units=metric&q=';
const fivedaysweatherurl = 'https://api.openweathermap.org/data/2.5/forecast?units=metric&q=';
const city=document.querySelector('.searchbox');
const btn=document.querySelector('#search-icon');
const geo=document.querySelector('#currentlocation')
btn.addEventListener('click', () => {
  
  currentWeather(currentweatherurl+city.value+'&appid='+apiKey);
  setTimeout(() => {
      fiveDaysForecast(fivedaysweatherurl+city.value+'&appid='+apiKey);
      hourlyForecast(fivedaysweatherurl+city.value+'&appid='+apiKey);
      city.value = "";
  }, 1000);
});
geo.addEventListener('click',()=>{
  getGeolocation();
}
)

async function currentWeather(url){
          const data=await fetch(url);
          const result=await data.json();
          if(data.ok){
            document.querySelector('.temp').innerHTML=Math.round(result.main.temp)+'°c';
            const weatherpic=document.querySelector('.weather-pic');
            weatherpic.src=getSourcePic(result);
            document.querySelector('.weather-desc').innerHTML=result.weather[0].description;
            document.querySelector('.loc').innerHTML=result.name+','+result.sys.country;
            todaydate=getDate(result.dt);
            document.querySelector('.cal-date').innerHTML=getDate(result.dt);
            todayHighlights(result);
          }
           else {
            console.error('City not found or API error');
           }
          
    }
    function getGeolocation() {
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
              const lat = position.coords.latitude;
              const lon = position.coords.longitude;
              currentWeather(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
              fiveDaysForecast(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
              hourlyForecast(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
          }, (error) => {
              console.error("Error getting geolocation:", error);
              document.getElementById('weather').textContent = "Unable to retrieve your location.";
          });
      } else {
          document.getElementById('weather').textContent = "Geolocation is not supported by this browser.";
      }
  }
function getSourcePic(result){
          if(result.weather[0].main=='Rain')
            return "./heavy-rain.png";
          else if(result.weather[0].description=='clear sky')
            return "./sun.png";
          else if(result.weather[0].description=='thunderstorm')
            return "./strom.png"
          else if(result.weather[0].description=='snow')
            return "./snow.png"
          else if(result.weather[0].description=='few clouds')
            return "./few clouds.png"
          else if(result.weather[0].description=='scattered clouds' || result.weather[0].description=='broken clouds' ||  result.weather[0].description=='overcast clouds')
            return "./scattered clouds.png"
          else if(result.weather[0].description=='haze')
            return "./haze.png";
}
const weekdays=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const months=['Jan','Feb','Mar','Apr','May','June','July','Aug','Sep','Oct','Nov','Dec'];
function getDate(unix){
    const d=new Date((unix)*1000);
    const day=weekdays[d.getUTCDay()];
    const date=d.getUTCDate();
    const month=months[d.getUTCMonth()];
    return `${day} ${date}, ${month}`;
}
function getTime(unix,tzone) {
  const localtime = new Date((unix) * 1000);
  const hours = localtime.getHours();
  const minutes = localtime.getMinutes();
  const period = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  return `${formattedHours}:${minutes < 10 ? '0' : ''}${minutes} ${period}`;
}

function todayHighlights(result){
      document.querySelector('.rise-time').innerHTML=getTime(result.sys.sunrise,result.timezone);
      document.querySelector('.set-time').innerHTML=getTime(result.sys.sunset,result.timezone) 
      document.querySelector('.humid-value').innerHTML=result.main.humidity+'%';
      document.querySelector('.pressure-value').innerHTML=result.wind.speed+'Km';
      document.querySelector('.feels-like').innerHTML=result.main.feels_like+'°c';
      document.querySelector('.vis-value').innerHTML=result.visibility/1000+'Km';
}
async function fiveDaysForecast(url){
  const result = await fetch(url);
  const data=await result.json();

  if (!data || !data.list) {
      console.error('Failed to fetch 5-day forecast data');
      return;
  }

  // Prepare to store the 5-day forecast data
  const fiveForecast = [];
  const forecastPerDay = 8; // There are 8 forecasts per day

  for (let i = 0; i < 5; i++) {
      // Extract the forecast data for noon (12:00:00) for each day
      const forecastData = data.list[i * forecastPerDay + 3]; // Forecasts are every 3 hours, so 3rd entry of each day
      
      if (forecastData) {
          const forecast = {
              t: forecastData.main.temp,
              imgsrc: getSourcePic(forecastData),
              date: getDate(forecastData.dt)
          };
          fiveForecast.push(forecast);
      }
  }

  // Update the HTML with the forecast data
  fiveForecast.forEach((forecast, index) => {
          document.querySelector(`.fivedays div:nth-child(${index+1}) img`).src = forecast.imgsrc;
          document.querySelector(`.temp${index + 1}`).innerHTML = `${Math.round(forecast.t)}°C`;
          const [dayName, month, dayDate] = forecast.date.split(' ');
          document.querySelector(`.date${index + 1}`).innerHTML = `${month} ${dayDate}`;
          document.querySelector(`.day${index + 1}`).innerHTML = dayName;
  });
}


async function hourlyForecast(url) {
  const response = await fetch(url);
  const data = await response.json();

  // Prepare to store the hourly forecast data
  const hourlyForecast = [];

  // Loop through the hourly data (every 3 hours) to get forecasts
  for (let i = 0; i < 8; i++) {
      const forecastData = data.list[i];
      const forecast = {
          time: getTime(forecastData.dt),
          temp: forecastData.main.temp,
          imgsrc: getSourcePic(forecastData)
      };
      hourlyForecast.push(forecast);
  }

  // Update the HTML with the hourly forecast data
  hourlyForecast.forEach((forecast, index) => {
      document.querySelector(`.hourly .hourly-time div:nth-child(${index + 1}) img`).src = forecast.imgsrc;
      document.querySelector(`.hourly .hourly-time div:nth-child(${index + 1}) .tempathour${index + 1}`).innerHTML = Math.round(forecast.temp) + '°c';
      document.querySelector(`.hourly .hourly-time div:nth-child(${index + 1}) .hour${index + 1}`).innerHTML = forecast.time;
  });
}
window.onload=getGeolocation;

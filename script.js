const userInput = document.querySelector("#location");
const searchButton = document.querySelector("#search");
const result = document.querySelector(".result");
const userDirection = document.querySelector("#user-direction");
const locationName = document.querySelector("#city-name");
const locationTime = document.querySelector("#location-time");
const locationTemperature = document.querySelector("#location-temperature");
const highTemp = document.querySelector("#high-temperature");
const lowTemp = document.querySelector("#low-temperature");
const windSpeed = document.querySelector("#wind");
const locationWeather = document.querySelector("#location-weather");
const quote = document.querySelector("#quote");
const author = document.querySelector("#author");
const form = document.querySelector("form");
const spinner = document.querySelector(".spinner");

const weatherCodes = {
    0: "Clear Sky",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Overcast",

    45: "Fog",
    48: "Depositing Rime Fog",

    51: "Light Drizzle",
    53: "Moderate Drizzle",
    55: "Dense Drizzle",

    56: "Light Freezing Drizzle",
    57: "Dense Freezing Drizzle",

    61: "Slight Rain",
    63: "Moderate Rain",
    65: "Heavy Rain",

    66: "Light Freezing Rain",
    67: "Heavy Freezing Rain",

    71: "Slight Snow",
    73: "Moderate Snow",
    75: "Heavy Snow",

    77: "Snow Grains",

    80: "Slight Rain Showers",
    81: "Moderate Rain Showers",
    82: "Violent Rain Showers",

    85: "Slight Snow Showers",
    86: "Heavy Snow Showers",

    95: "Thunderstorm",

    96: "Thunderstorm with Slight Hail",
    99: "Thunderstorm with Heavy Hail"
};

async function getCordinates(input){
    try{
        const cordinatesResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${input}&count=1`);
        if(!cordinatesResponse.ok){
            throw new Error("Failed to fetch cordinates");
        }
        const cordinatesData = await cordinatesResponse.json();
        const city = input.charAt(0).toUpperCase()+input.slice(1);
        return {
            longi:cordinatesData.results[0].longitude,
            lati:cordinatesData.results[0].latitude,
            cityName:city
        }
    }
    catch(error){
        throw error;
    };
}
async function getWeather(longi,lati,cityName) {
    try{
        const weatherResponse = 
            await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lati}&longitude=${longi}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min`);
        if(!weatherResponse.ok){
            throw new Error("Failed to fetch weather");
        }
        const weatherData =
            await weatherResponse.json();
        const date = new Date(weatherData.current.time);
        const formattedDate = date.toLocaleDateString(
            "en-US",{
                weekday:"long",
                day:"numeric",
                month:"long"
            }
        );
        
        return {
            city:cityName,
            temperature:weatherData.current.temperature_2m,
            weather:weatherData.current.weather_code,
            date:formattedDate,
            highTemp:weatherData.daily.temperature_2m_max[0],
            lowTemp:weatherData.daily.temperature_2m_min[0],
            windSpeed:weatherData.current.wind_speed_10m,

        }
    }
    catch(error){
        throw error;
    };
}


function setData(data) {
    locationName.textContent = `${data.city}`;
    locationTime.textContent = `${data.date}`;
    locationTemperature.innerHTML = `${data.temperature}<span id="c-logo">°C</span>`;
    locationWeather.textContent = `${weatherCodes[data.weather]}`;
    highTemp.textContent = `${data.highTemp}°C`;
    lowTemp.textContent = `${data.lowTemp}°C`;
    windSpeed.textContent = `${data.windSpeed}km/h`;
}


async function oneForAll(city){
    try{
        spinner.classList.remove("hidden");
        const cordinates =
            await getCordinates(city);
        const weather =
            await getWeather(cordinates.longi,cordinates.lati,cordinates.cityName);
        spinner.classList.add("hidden");
        await setData(weather);
        localStorage.setItem("userCity",cordinates.cityName);
    }
    catch(error){
        throw error;
    }
    finally{
        if(!spinner.classList.contains("hidden")){
            spinner.classList.add("hidden");
        }
    }
}
async function getQuoteSet() {
    try{
        const quoteResponse = 
            await fetch("https://dummyjson.com/quotes");
        if(!quoteResponse.ok){
            throw new Error("Failed to fetch quote")
        }
        const quoteData = 
        await quoteResponse.json();
        
        const index = Math.floor(Math.random()*quoteData.quotes.length);
        quote.textContent = `
        ${quoteData.quotes[index].quote}
        `;
        author.textContent = `
        ― ${quoteData.quotes[index].author}
        `;
        
    }
    catch(error){
        throw error;
    };
}

const defaultCity = "delhi";
const savedCity = localStorage.getItem("userCity"); 
console.log(savedCity==="");
if(savedCity === null){
    oneForAll(defaultCity);
    getQuoteSet();
}
else{
    oneForAll(savedCity);
    getQuoteSet();
}

form.addEventListener("submit",(event)=>{
    event.preventDefault();
    if(userInput.value === ""){
        return
    }
    userInput.setAttribute("placeholder","");
    oneForAll(userInput.value);
    getQuoteSet();
});

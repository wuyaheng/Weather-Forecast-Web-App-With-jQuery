var userCityArray = JSON.parse(localStorage.getItem("userCityArray")) || [];
const base_url = "https://maps.googleapis.com/maps/api/geocode/json"
var historyObj = {}
var MAP_CONTAINER = document.getElementById('mapidContainer')

localStorage.clear();

$("#search-button").on("click", function(event) {
    event.preventDefault();
    var searchValue = $("#search-value").val();
    userCityArray.push(searchValue);
 
    localStorage.setItem("userCityArray", JSON.stringify(userCityArray));

    for (var i = 0; i < userCityArray.length; i++) {
        var cityButton = $('<button/>')
        .addClass("btn btn-light d-inline historyItem mr-1 mt-1")
        .text(userCityArray[i])
        .click(() => {
            getWeatherForCity(searchValue)
        })
    } 
    $(".history").append(cityButton);
    getWeatherForCity(searchValue)
});


function getWeatherForCity(name) {
    if(historyObj[name]) {
        console.log("first function")
        updateCurrentWeather(name);
        console.log("second function") 
        updateForecastWeather(name) 
    } else {
        var queryCurrentURL = "https://api.openweathermap.org/data/2.5/weather?q=" + name + "&APPID=" + apiKey;
        $.ajax({
            url: queryCurrentURL,
            method: "GET"
        }).then(data => {
            console.log("fetched data for current", data)
            addToHistoryObj(data.name, "current", data)
            updateCurrentWeather(data.name)
        });
    
        var queryForecastURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + name + "&APPID=" + apiKey;
        $.ajax({
            url: queryForecastURL,
            method: "GET"
        }).then(data => {
            console.log("fetched data for forecast", data) 
            addToHistoryObj(data.city.name, "forecast", data)
            updateForecastWeather(data.city.name) 
        });
    }
}

function updateForecastWeather(name){
    console.log("update forecast weather") 
    const ForecastData = historyObj[name].forecast 
    $("#forecastContainer").html("<div>").append("<div class='row justify-content-between text-justify' id='forecastRowContainer'>");
    for(var i = 0; i < ForecastData.list.length; i++) { 
        if(ForecastData.list[i].dt_txt.indexOf("15:00:00") !== -1) {
            var col = $("<div>").addClass("forecast-div").addClass("col-md-2").addClass("card hoverable mb-3").addClass("cardBackground");
            var Ftemp_f = $("<p>").addClass("card-text").text("Temperature: " + ((Number(JSON.stringify(ForecastData.list[i].main.temp)) - 273.15) * 9/5 + 32).toFixed(2) + " °F");
            var humid_f = $("<p>").addClass("card-text").text("Humidity: " + JSON.stringify(ForecastData.list[i].main.humidity) + "%");
            var wind_f = $("<p>").addClass("card-text mb-2").text("Wind Speed: " + JSON.stringify(ForecastData.list[i].wind.speed) + " MPH");
            var img_f = $("<img>").addClass("h-100 rounded mx-auto d-block").attr("src","https://openweathermap.org/img/wn/" + ForecastData.list[i].weather[0].icon + "@2x.png").addClass("fixImg");
            var descr_F = $("<p>").addClass("card-text text-center textEffect text-white mb-2").text(JSON.parse(JSON.stringify(ForecastData.list[i].weather[0].description)));
            var Datef = $("<p>").addClass("card-text text-center mt-2").text(JSON.parse(JSON.stringify(ForecastData.list[i].dt_txt)).substring(0, 10));
            col.append(Datef, img_f, descr_F, Ftemp_f, humid_f, wind_f);
            $("#forecastRowContainer").append(col);
        }
    }
}


function updateCurrentWeather(cityName) {
    console.log("update current weather")  
    var data = historyObj[cityName].current
    var title = $("<h3>").addClass("card-title text-center").text(JSON.parse(JSON.stringify(data.name)));
    // (K − 273.15) × 9/5 + 32 = °F
    var Ftemp = $("<p>").addClass("card-text").text("Temperature: " + ((Number(JSON.stringify(data.main.temp)) - 273.15) * 9/5 + 32).toFixed(2) + " °F");
    var humid = $("<p>").addClass("card-text").text("Humidity: " + JSON.stringify(data.main.humidity) + "%");
    var wind = $("<p>").addClass("card-text").text("Wind Speed: " + JSON.stringify(data.wind.speed) + " MPH");
    var img = $("<img>").attr("src","https://openweathermap.org/img/wn/" + data.weather[0].icon + "@2x.png").addClass("rounded mx-auto d-block"); 
    var descr = $("<p>").addClass("card-text text-center textEffect").text(JSON.parse(JSON.stringify(data.weather[0].description)));
    // var currentDate = moment().format('MMMM Do YYYY, h:mm A')  
    // $(".card-header").html("<div>").append(currentDate); 
    $("#todayContainer").html("<div>").append(title, img, descr, Ftemp, humid, wind); 


    MAP_CONTAINER.innerHTML = "" 
    const MAP_ID = document.createElement("div");
    MAP_ID.setAttribute("id", "mapid");
    MAP_CONTAINER.appendChild(MAP_ID);
    var mymap = L.map('mapid').setView([40, -97], 4);

    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: apiKeyMap
    }).addTo(mymap);


    for(var key in historyObj) {
        var ele = historyObj[key]
        L.marker([ele.current.coord.lat, ele.current.coord.lon]).addTo(mymap).bindTooltip(ele.current.name)
    }
}

function addToHistoryObj(city, dataType, data) {
    if (!historyObj[city]) { 
        historyObj[city] = {}
        console.log(historyObj)
    }
    historyObj[city][dataType] = data 
}







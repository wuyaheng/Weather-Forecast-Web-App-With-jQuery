// add click event to search button
$("#search-button").on("click", function(event) {
    // prevent page from reloading on form submit
    event.preventDefault();
    // build the query url for the ajax request to the open weather API
    var searchValue = $("#search-value").val();
    var apiKey = "76093c5b76715cabd5992fc44d0a2e7e"
    var queryCurrentURL = "http://api.openweathermap.org/data/2.5/weather?q=" + searchValue + "&APPID=" + apiKey;
    // make ajax request to the API and GET JSON data
    // data then passed as an argument to the updatePage function
    $.ajax({
        url: queryCurrentURL,
        method: "GET"
    }).then(updateCurrentWeather);

    //api.openweathermap.org/data/2.5/forecast?q
    var queryForecastURL = "http://api.openweathermap.org/data/2.5/forecast?q=" + searchValue + "&APPID=" + apiKey;
    $.ajax({
        url: queryForecastURL,
        method: "GET"
    }).then(updateForecastWeather);
});

function updateForecastWeather(ForecastData){
    for(var i = 0; i < ForecastData.list.length; i++) {
        if(ForecastData.list[i].dt_txt.indexOf("15:00:00") !== -1) {
            console.log(ForecastData);
            var col = $("<div>").addClass("forecast-div").addClass("col-md-2");
            var Ftemp_f = $("<p>").addClass("card-text").text("Temperature: " + ((Number(JSON.stringify(ForecastData.list[i].main.temp)) - 273.15) * 9/5 + 32).toFixed(2) + " °F");
            var humid_f = $("<p>").addClass("card-text").text("Humidity: " + JSON.stringify(ForecastData.list[i].main.humidity) + "%");
            var wind_f = $("<p>").addClass("card-text").text("Wind Speed: " + JSON.stringify(ForecastData.list[i].wind.speed) + " MPH");
            var img_f = $("<img>").attr("src","http://openweathermap.org/img/wn/" + ForecastData.list[i].weather[0].icon + "@2x.png");
            col.append(img_f, Ftemp_f, humid_f, wind_f);
            $("#forecastContainer").append(col);
        }
    }
}


function updateCurrentWeather(Data) {
    var title = $("<h3>").addClass("card-title").text(JSON.parse(JSON.stringify(Data.name)));
   
    // (K − 273.15) × 9/5 + 32 = °F
    var Ftemp = $("<p>").addClass("card-text").text("Temperature: " + ((Number(JSON.stringify(Data.main.temp)) - 273.15) * 9/5 + 32).toFixed(2) + " °F");
    var humid = $("<p>").addClass("card-text").text("Humidity: " + JSON.stringify(Data.main.humidity) + "%");
    var wind = $("<p>").addClass("card-text").text("Wind Speed: " + JSON.stringify(Data.wind.speed) + " MPH");
    var img = $("<img>").attr("src","http://openweathermap.org/img/wn/" + Data.weather[0].icon + "@2x.png");
    var currentDate = moment().format('MMMM Do YYYY, h:mm A')  
    $(".card-header").append(currentDate);
    $("#todayContainer").append(title, img, Ftemp, humid, wind); 
}



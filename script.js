// add click event to search button
$("#search-button").on("click", function(event) {
    // prevent page from reloading on form submit
    event.preventDefault();
    // build the query url for the ajax request to the open weather API
    var searchValue = $("#search-value").val();
    var apiKey = "76093c5b76715cabd5992fc44d0a2e7e"
    var queryURL = "http://api.openweathermap.org/data/2.5/weather?q=" + searchValue + "&APPID=" + apiKey
    // make ajax request to the API and GET JSON data
    // data then passed as an argument to the updatePage function
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(updateCurrentWeather);
});



function updateCurrentWeather(Data) {
    console.log(Data)
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



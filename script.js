var userCityArray = JSON.parse(localStorage.getItem("userCityArray")) || [];
const base_url = "https://maps.googleapis.com/maps/api/geocode/json"
var historyObj = {}
var MAP_CONTAINER = document.getElementById('mapidContainer')

getWeatherForCity("Seattle")
getWeatherForCity("Houston")
getWeatherForCity("New York")

var colorArr = ['#cea2ac', '#bad0cf', '#c2cac1', '#fdcbac', '#e1ccba', '#3c787e', '#98c1d9', '#58586b', '#85ad87']



populateLineChart()


localStorage.clear();

$("#search-button").on("click", function(event) {
    event.preventDefault();
    var searchValue = $("#search-value").val();

    getWeatherForCity(searchValue)
});

function populateCityBtn() {
    $(".history").empty()
    for (var i = 0; i < userCityArray.length; i++) { 
        let city = userCityArray[i]
        var cityButton = $('<button/>')
        .addClass("btn btn-light d-inline historyItem mr-1 mt-1")
        .text(userCityArray[i])
        .click(() => {
            getWeatherForCity(city)
        })
        $(".history").append(cityButton);
    } 
}


function getWeatherForCity(name) {
    if(historyObj[name]) {
        updateCurrentWeather(name);
    } else {
        var queryCurrentURL = "https://api.openweathermap.org/data/2.5/weather?q=" + name + "&APPID=" + apiKey;
        $.ajax({
            url: queryCurrentURL,
            method: "GET"
        }).then(data => {
            addToHistoryObj(data.name, "current", data)
            updateCurrentWeather(data.name)
        });

        var queryForecastURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + name + "&APPID=" + apiKey;
        $.ajax({
            url: queryForecastURL,
            method: "GET"
        }).then(data => {
            addToHistoryObj(data.city.name, "forecast", data)

            var newDataForChart = []

            for (var i = 0; i < Object.keys(historyObj).length; i++) {
                newDataForChart.push({
                label: Object.keys(historyObj)[i], 
                lineTension: 0,
                data: Object.values(historyObj)[i]?.forecast?.list.map((ele) => ((Number(JSON.stringify(ele.main.temp)) - 273.15) * 9/5 + 32).toFixed(0)), 
                fill: false,
                borderColor: colorArr[i],
                backgroundColor: colorArr[i],  
                borderWidth: 1 
                })
            }
            document.getElementById("chartContainer").innerHTML = '&nbsp;';
            document.getElementById("chartContainer").innerHTML = '<canvas id="myChart"></canvas>';
            var ctx = document.getElementById("myChart").getContext("2d");

            var myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Object.values(historyObj)[0]?.forecast.list.map((ele) => moment(ele.dt_txt).calendar()),
                datasets: newDataForChart
            },
                options: {
                    plugins: {
                        responsive: true, 
                        maintainAspectRatio: false, 
                        title: {
                            display: true,
                            text: '5 Days Temperature Forecast'
                            }
                        },
                    scales: {
                        y: {
                        display: true,
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Fahrenheit (°F)'
                        }
                        }
                    }
        
                    }
            });

        });
    }
}


function updateCurrentWeather(cityName) {
    if(!userCityArray.includes(cityName)) {
        userCityArray.push(cityName);
    }

    $('#search-value').val('')

    populateCityBtn()
    var data = historyObj[cityName].current
    var title = $("<h5>").addClass("card-title text-center").text(JSON.parse(JSON.stringify(data.name)));
    var Ftemp = $("<p>").addClass("card-text").text("Temperature: " + ((Number(JSON.stringify(data.main.temp)) - 273.15) * 9/5 + 32).toFixed(0) + " °F" + " / " + (Number(data.main.temp) - 273.15).toFixed(0) + " °C");
    var humid = $("<p>").addClass("card-text").text("Humidity: " + JSON.stringify(data.main.humidity) + "%");
    var wind = $("<p>").addClass("card-text").text("Wind Speed: " + JSON.stringify(data.wind.speed) + " MPH");
    var img = $("<img>").attr("src","https://openweathermap.org/img/wn/" + data.weather[0].icon + "@2x.png").addClass("rounded mx-auto d-block"); 
    var descr = $("<p>").addClass("card-text text-center textEffect").text(JSON.parse(JSON.stringify(data.weather[0].description)));
    var currentDate = moment().format('LLL')  
    $(".currentDate").html("<div>").append(currentDate); 
    $("#todayContainer").html("<div>").append(title, img, descr, Ftemp, wind, humid); 


    MAP_CONTAINER.innerHTML = "" 
    const MAP_ID = document.createElement("div");
    MAP_ID.setAttribute("id", "mapid");
    MAP_CONTAINER.appendChild(MAP_ID);

    var screenWidth = document.documentElement.clientWidth;
    if (Number(screenWidth) < 768) {
        var mymap = L.map('mapid').setView([40, -97],3);
    } else {
        var mymap = L.map('mapid', {zoomControl: false}).setView([40, -97],4);
    }


    L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
	maxZoom: 20,
	attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
}).addTo(mymap);


    var pinIcon = L.icon({
        iconUrl: 'map-pin.png',
        iconSize: [25, 25], 
        iconAnchor:   [12, 25], 
        popupAnchor:  [0, 20] 
    });

    for(var key in historyObj) {
        var ele = historyObj[key]
        L.marker([ele.current.coord.lat, ele.current.coord.lon], {icon: pinIcon}).addTo(mymap).bindTooltip("<div class='tooltipContainer'><img src='https://openweathermap.org/img/wn/" + ele.current.weather[0].icon + "@2x.png'/>" + "<p><b>"+ ele.current.name +"</b></p><p>" + ((Number(JSON.stringify(ele.current.main.temp)) - 273.15) * 9/5 + 32).toFixed(0) + "°F / " + (Number(JSON.stringify(ele.current.main.temp)) - 273.15).toFixed(0) + "°C" +" </p></div>").openTooltip();
    }

    var geoJson = L.geoJson(geodata.features, {
        style: function (feature) {
          return {
            color: "white",
            fillColor: "#EFD9CE",
            fillOpacity: 0.7,
            weight: 1.5
          };
        },      
        onEachFeature: function (feature, layer) {
          layer.on({
            mouseover: function (event) {
              layer = event.target;
              layer.setStyle({
                fillOpacity: 1
              });
            },
            mouseout: function (event) {
              geoJson.resetStyle(event.target);
            },
            click: function (event) {
              myMap.fitBounds(event.target.getBounds());
            }
          });
          layer.bindTooltip("<p><b>" + feature.properties.name + "</b></p>");
        }
      }).addTo(mymap);
}

function addToHistoryObj(city, dataType, data) {
    if (!historyObj[city]) { 
        historyObj[city] = {}
        console.log(historyObj)
    }
    historyObj[city][dataType] = data 
}


function populateLineChart() {
    var dataForChart = []

    for (var i = 0; i < Object.keys(historyObj).length; i++) {
        dataForChart.push({
        label: Object.keys(historyObj)[i], 
        lineTension: 0,
        data: Object.values(historyObj)[i]?.forecast?.list.map((ele) => ((Number(JSON.stringify(ele.main.temp)) - 273.15) * 9/5 + 32).toFixed(0)), 
        fill: false,
        borderColor: colorArr[i],
        backgroundColor: colorArr[i],  
        borderWidth: 1 
        })
    }

    document.getElementById("chartContainer").innerHTML = '&nbsp;';
    document.getElementById("chartContainer").innerHTML = '<canvas id="myChart"></canvas>';
    var ctx = document.getElementById("myChart").getContext("2d");
    var myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: Object.values(historyObj)[0]?.forecast.list.map((ele) => moment(ele.dt_txt).calendar()),
        datasets: dataForChart
    },
        options: {
            plugins: {
                responsive: true, 
                maintainAspectRatio: false, 
                title: {
                    display: true,
                    text: '5 Days Temperature Forecast'
                    }
                },
            scales: {
                y: {
                display: true,
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Fahrenheit (°F)'
                }
                }
            }

            }
    });
}





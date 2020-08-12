let date = new Date()
let todaysDate = date.getMonth() + "/" + date.getDate() + "/" + date.getFullYear()

// clear out localStorage:
$("#clearBtn").click(function () {
    $("#searched-cities").empty();
    localStorage.clear();
});


$("#searchBtn").on("click", function (event) {
    event.preventDefault();

    let city = $("#city-search").val();

    let state = $("#state-search").val();

    runWeather(city, state);
    saveWeather(city, state);
    clearSearch();

});




function clearSearch(){
    $("#city-search").val("");
    $("#state-search").val("");
}

function runWeather(city, state) {

    let country = $("#country-search").val();

    let searchKey = city + "," + state + "," + country

    let APIKey = "a4a8fbe7c144be93020e3a7f15b622db"

    let forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${searchKey}&appid=${APIKey}`;

    let uvIndex = $("<li>")
    uvIndex.addClass("uvIndex")
    uvIndex.attr("id", "uv-Index")
    uvIndex.addClass("w3-button")


    $.ajax({
        url: forecastURL,
        method: "GET"

    })
        .then(function (response1) {

            // console.log(forecastURL);

            console.log(response1);

            $(".forecast").empty()
            $("#current-weather").empty()

            // this will give me an average out of the next 5 days.
            for (let i = 0; i < response1.list.length; i += 8) {



                let hourlyForecast = response1.list[i].weather[0];

                let localDate = new Date(response1.list[i].dt * 1000).toLocaleDateString();

                // this sets the five day forecast
                console.log(response1.list[i]);

                let forecastDate = $("<label>");
                forecastDate.text(localDate)

                let forecastImg = $("<img>")
                let weatherIcon = `http://openweathermap.org/img/wn/${hourlyForecast.icon}@2x.png`;
                forecastImg.attr("src", weatherIcon);


                let forecastList = $("<ul style='list-style-type:none'</ul>")
                let forecastTemp = $("<li>");
                forecastTemp.text(((response1.list[i].main.temp - 273.15) * 1.80 + 32).toFixed(0) + " F ");

                let forecastHumid = $("<li>");
                forecastHumid.text(" Humidity: " + response1.list[i].main.humidity)

                forecastList.append(forecastTemp).append(forecastHumid)


                let forecast = $("<div class='forecastContainer'></div>");

                forecast.append(forecastDate).append(forecastImg).append(forecastList);


                $(".forecast").append(forecast);



            }

            // this sets the current weather
            let currentWeather = response1.list[0].weather[0];
            let currentDate = new Date(response1.list[0].dt * 1000).toLocaleDateString();

            let today = $("<li>");
            today.text(currentDate);


            let currentImg = $("<img>");
            let todaysIcon = `http://openweathermap.org/img/wn/${currentWeather.icon}@2x.png`
            currentImg.attr("src", todaysIcon)

            let currentTemp = $("<li>")
            currentTemp.text(((response1.list[0].main.temp - 273.15) * 1.80 + 32).toFixed(0) + " F ")

            let currentHumid = $("<li>");
            currentHumid.text("Humidity: " + response1.list[0].main.humidity)

            let currentWind = $("<li>")
            currentWind.text("Wind: " + response1.list[0].wind.speed + "mph")

            let currentWeatherDisplay = $("<li></li>")

            let currentLocation = city+ ", " + state

            currentWeatherDisplay.append(currentWeather).append(today).append(currentImg).append(currentTemp).append(currentHumid).append(currentWind).append(uvIndex)

            $("#current-weather").append(currentLocation).append(currentWeatherDisplay).addClass("capitalize")

            

            return response1.city.coord

        })
        // This gives me the UV index
        .then(function (response2) {
            console.log(response2)
            let uvURL = `http://api.openweathermap.org/data/2.5/uvi?appid=${APIKey}&lat=${response2.lat}&lon=${response2.lon}`

            $.ajax({
                url: uvURL,
                method: "GET"
            })
                .then(function (response3) {
                    console.log(uvURL)
                    console.log(response3)

                    uvIndex.text("UV Index: " + response3.value)

                    $("#uv-Index").on("click", function () {
                        $("#uv-Modal").attr("style", "display:block")
                    })


                })

        })

};

// This will save the weather so that I can call it seperately for previous searched cities
// This sets the previous searched cities

function saveWeather(city, state) {
    let locationSearch = city + ", " + state

            let searchedLocations = $("<div class='capitalize w3-button'>")

            let count = 0

            searchedLocations.attr("id", `city${count++}`)

            searchedLocations.text(locationSearch)


            $("#searched-cities").append(searchedLocations)


            let locationList = JSON.parse(localStorage.getItem("locationSearch")) || [];

            let newLocation = {
                "locationSearch": locationSearch
            }
            locationList.push(newLocation);
            localStorage.setItem("locationSearch", JSON.stringify(locationList))

           searchedLocations.on("click", function () {
        
                let cityNameGrab1 = $(this).text()
                console.log(cityNameGrab1, "citygrab1")
        
                let cityNameGrab2 = cityNameGrab1.substring(0, cityNameGrab1.indexOf(","));
                city = cityNameGrab2
                let stateNameGrab = cityNameGrab1.substring(cityNameGrab1.indexOf(",") +1); 
                state = stateNameGrab
            
                runWeather(city, state);
            
            })
        
}

// This allows the cities searched to show up after the page has been reloaded
$(document).ready(function showCities() {
    let locationList = JSON.parse(localStorage.getItem("locationSearch")) || [];
    console.log(locationList, "My location List")
    $("#searched-cities").empty();

    let cityCount = 0

    locationList.forEach(function (locationList) {
        let cityID = "city" + cityCount
        cityCount++;
        console.log(cityID, "cityID")

        $("#searched-cities").append(`<div class='capitalize w3-button' id=${cityID}>` + locationList.locationSearch + "</div>");

    });

    if (cityCount > 0) {
        let recentCity = locationList[locationList.length - 1].locationSearch

        console.log(recentCity, "recentCity")

        let city = recentCity.substring(0, recentCity.indexOf(","));
       
        let state = recentCity.substring(recentCity.indexOf(",") +1); 
       
    
        runWeather(city, state);
    }

    // this allows me to grab the text value of a previous searched city and pass it back through the ajax call

    $(".capitalize").on("click", function () {
        
        let cityNameGrab1 = $(this).text()
        console.log(cityNameGrab1, "citygrab1")

        let city = cityNameGrab1.substring(0, cityNameGrab1.indexOf(","));

        let state = cityNameGrab1.substring(cityNameGrab1.indexOf(",") +1); 
        
    
        runWeather(city, state);
    
    })
    
});






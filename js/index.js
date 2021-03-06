$(document).ready(function(){
  (function(){
    var coords = {};
    var weekdays = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];
    var currentDate = new Date();
    var currentWeather = {temp: 0, summary: '', icon: ''};
    var dailyWeatherDetails = {};
    var weeklyReport = [];
    var conditions = [{condition: 'clear-day',
                       icon: '<i class="wi wi-day-sunny"></i>'},
                      {condition: 'clear-night',
                       icon: '<i class="wi wi-night-clear"></i>'},
                      {condition: 'rain',
                       icon: '<i class="wi wi-showers"></i>'},
                      {condition: 'snow',
                       icon: '<i class="wi wi-snow"></i>'},
                      {condition: 'wind',
                       icon: '<i class="wi wi-cloudy-windy"></i>'},
                      {condition:'fog',
                       icon:  '<i class="wi wi-fog"></i>'},
                      {condition:'sleet',
                       icon: '<i class="wi wi-sleet"></i>'},
                      {condition: 'cloudy',
                       icon: '<i class="wi wi-cloudy"></i>'},
                      {condition: 'partly-cloudy-day',
                       icon: '<i class="wi wi-day-cloudy"></i>'},
                      {condition: 'partly-cloudy-night',
                       icon: '<i class="wi wi-night-alt-cloudy"></i>'}];

    Date.prototype.addDays = function(days) {
      var dat = new Date(this.valueOf());
      dat.setDate(dat.getDate() + days);
      return dat;
    }

    /* Check for geolocation support */
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(success);
    }
    else {
      alert('location not supported');
    }

    /*  If supported sends location data here. Assign coords.lat & coords.longitude
     *  for use in getWeather() and getLocation()
     */
    function success(position){
      coords.lat = position.coords.latitude;
      coords.long = position.coords.longitude;
      getWeather();
      getLocation();
    }

    function getWeather(){
      $.ajax({
        url: 'https://api.darksky.net/forecast/a3dd3862b9791447f3b31d280a5678aa/'
        + coords.lat + ',' + coords.long,
        dataType: 'jsonp',
        success: function(weatherData){
          if($('#loader')) { $('#loader').remove(); }
          if($('#title').hasClass('hide')) {
            $('#title').removeClass('hide');
            $('button').removeClass('hide');
          }

          // Assign current weather data
          currentWeather.temp = Math.ceil(weatherData.currently.temperature);
          currentWeather.summary = weatherData.currently.summary;
          $.each(conditions, function(_, c){
            if(c.condition === weatherData.currently.icon){
              currentWeather.icon = c.icon;
            }
          });

          $('#icon').html(currentWeather.icon + '<br>');
          $('#temp').html(currentWeather.temp + ' F°<br>');
          $('#summary').text(currentWeather.summary);

          // Build weeklyReport array
          (function(){
            var dayCounter = currentDate.getDay();
            var dateCounter = 0;
            var weekday;
            var date;
            var temps
            $.each(weatherData.daily.data, function(num, day){
              weekday = weekdays[dayCounter++];
              if(dayCounter >= weekdays.length) { dayCounter = 0;}
              date = new Date();
              temps = {high: Math.ceil(day.apparentTemperatureMax),
                          low: Math.ceil(day.apparentTemperatureMin)};

              $.each(conditions, function(_, c){
                if(c.condition === day.icon){
                  day.icon = c.icon;
                }
              });

              weeklyReport[num] = {
                  weekday: weekday,
                  date: date.addDays(dateCounter++).toString().substring(0, 15),
                  temps: temps,
                  summary: day.summary,
                  icon: day.icon
              };
            });
          })();

          dailyWeatherDetails = weeklyReport[0];

          $.each(weeklyReport, function(_, dailyReport){
            $('#weeklyWeather').append('<div class="daily-weather"><strong>' +
            dailyReport.weekday + '</strong><br>' + dailyReport.icon +
            '<br><span class="temp-label">high: </span>' + dailyReport.temps.high +
            '</span><br><span class="temp-label">low: </span>' + dailyReport.temps.low + '</div>');
          });

          (function(){
            var daily = $('.daily-weather');
            $.each(daily, function(i, day){
              day.addEventListener('click', function(){
                dailyWeatherDetails = weeklyReport[i];
                updateDaily();
              })
            });
          })();
        },
        cache: false,
        error: function(e){
          console.log(e);
        }
      });
    }

    $('#forecastToggle').on('click', function(){
      if($('#weather').hasClass('current')){
        updateDaily();
      }
      else if($('#weather').hasClass('daily')){
        $('#forecastToggle').text('VIEW DAILY');
        $('#title').text('Currently')
        $('#weather').removeClass('daily').addClass('current');
        $('#icon').html(currentWeather.icon + '<br>');
        $('#temp').html(currentWeather.temp + ' F°<br>');
        $('#summary').text(currentWeather.summary);
      }
    });

    var updateDaily = function(){
      $('#forecastToggle').text('VIEW CURRENT');
      $('#weather').removeClass('current').addClass('daily');
      $('#title').text(dailyWeatherDetails.date);
      $('#icon').html(dailyWeatherDetails.icon + '<br>');
      $('#temp').html('High ' + dailyWeatherDetails.temps.high + ' F°<br>'
                             + 'Low ' + dailyWeatherDetails.temps.low + ' F°<br>');
      $('#summary').text(dailyWeatherDetails.summary);
    };

    function getLocation(){
      $.ajax({
        url: 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + coords.lat + ',' + coords.long + '&key=AIzaSyCaeSa04UTMMMDcXQMEfADLVKqzUYOxWAI',
        dataType: 'json',
        success: function(locationData){
          if($('#loader')) { $('#loader').remove(); }
          if($('#current .title').hasClass('hide')) { $('# current.title').removeClass('hide') }
          $('#location').html(locationData.results[2].address_components[0].long_name + ', ' + locationData.results[2].address_components[1].long_name);
        },
        error: function(e){
          console.log(e.error_message);
        }
      });
    }

  })();
});

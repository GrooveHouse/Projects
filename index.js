var map;
var distService;
var directionService;
var geocodeService;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 38.858467, lng: -94.673165},
    zoom: 10
  });
  distService = new google.maps.DistanceMatrixService();
  directionService = new google.maps.DirectionsService();
  geocodeService = new google.maps.Geocoder();
}

var distance;
var time;
var lowestDist;
var lowestTime;

var indexOfLowestDist;
var indexOfLowestTime;
var currentIndex;

var startOrderDist = [];
var endOrderDist = [];
var startOrderTime = [];
var endOrderTime = [];

var completedDistOrder = [];
var completedTimeOrder = [];

var destsAvailable = [];
var latlongsStrings = [];

var markers = [];
var latlongs = [];
var lats = [];
var longs = [];

function updateMap() {
  //initMap();
  for (var x = 0; x < markers.length; x++) {
    markers[x].setMap(null);
  }
  markers = [];
  latlongs = [];
  /**for (var i = 0; i < addresses.length; i++) {
    geocodeService.geocode({
      address: addresses[i]
    }, callbackGeocode);
  }*/

  var i = 0;
  var geocodeAddresses = setInterval(function() {
    if (i < addresses.length) {
      geocodeService.geocode({
        address: addresses[i]
      }, callbackGeocode);
    } else {
      clearInterval(geocodeAddresses);
    }
    i++
  }, 100);

  var timeToWait = addresses.length * 200;

  setTimeout(function() {
    //setCenterOfMap();
    //document.getElementById("test").innerHTML = " and done";
    findOrderOfDestinationsDist();
  },timeToWait);
  //findOrderOfDestinationsDist();
}

function callbackGeocode(results, success) {
  var latlong = results[0].geometry.location;
  var latlongString = "" + latlong;
  latlongString = latlongString.replace("(", "");
  latlongString = latlongString.replace(")", "");
  var latsAndLongs = latlongString.split(",");
  latsAndLongs[1] = latsAndLongs[1].replace(" ", "");
  lats.push(latsAndLongs[0]);
  longs.push(latsAndLongs[1]);

  latlongs.push(latlong);
  latlongsStrings.push(latlongString);
  destsAvailable.push(latlong);

  var marker = new google.maps.Marker({
    position: latlong
  });
  /**
  distService.getDistanceMatrix({
      origins: [origin],
      destinations: [latlong],
      travelMode: "DRIVING"
      //avoidTolls: true,
      //unitSystem: google.maps.UnitSystem.IMPERIAL
    }, callbackDist);*/
  marker.setMap(map);
  markers.push(marker);
}

function setCenterOfMap() {
  var latTotal = 0.0;
  var avgLat;
  for (var i = 0; i < lats.length; i++) {
    latTotal += lats[i];
  }
  avgLat = latTotal / lats.length;

  var longTotal = 0;
  var avgLong;
  for (var i = 0; i < longs.length; i++) {
    longTotal += longs[i];
  }
  avgLong = longTotal / longs.length;

  var centerLatLng = new google.maps.LatLng(avgLat, avgLong);
  document.getElementById("test").innerHTML = centerLatLng;

}

function findOrderOfDestinationsDist() {
  var numOfDests = destsAvailable.length;

  //start and end coordinates
  var startEndCoords = new google.maps.LatLng(38.849462, -94.705884);

  //reset and/or declare arrays
  startOrderDist = [];
  endOrderDist = [];

  //even number of destinations
  if (numOfDests % 2 == 0) {
    //distance arrays
    startOrderDist.push(startEndCoords);
    endOrderDist.push(startEndCoords);

    var start = true;
    var i = 0;
    currentIndex = 0;
    var repetitions = 0;
    var orderEven = setInterval(function() {
      //document.getElementById("test").innerHTML += " " + i;
      var zeroCheck = true;
      for (var j = 0; j < destsAvailable.length; j++) {
        if (zeroCheck == true) {
          if (destsAvailable[j] != "undefined") {
            zeroCheck = false;
          }
        }
      }
      if (zeroCheck == true) {
        destsAvailable = [];
      }
      if (destsAvailable.length > 0) {
        document.getElementById("test").innerHTML += " continue";
        if (start == true) {
          if (repetitions == 0) {
            repetitions++;
            i = 0;
          } else {
            i++;
          }

          var typeOfDestsStart = typeof destsAvailable[i];
          if (typeOfDestsStart != "undefined" || typeOfDestsStart == "object") {
            if (i < destsAvailable.length) {
              currentIndex = i;
              //add to beginning array
              document.getElementById("test").innerHTML += " start " + i;
              //document.getElementById("test").innerHTML += " " + typeof startOrderDist[startOrderDist.length - 1];
              distService.getDistanceMatrix({
                  origins: [startOrderDist[startOrderDist.length - 1]],
                  destinations: [destsAvailable[i]],
                  travelMode: "DRIVING"
                  //avoidTolls: true,
                  //unitSystem: google.maps.UnitSystem.IMPERIAL
                }, callbackDist);
            } else {
              startOrderDist.push(new google.maps.LatLng(lats[indexOfLowestDist], longs[indexOfLowestDist]));
              destsAvailable[indexOfLowestDist] = 0;
              start = false;
              repetitions = 0;
            }
          } else if (i >= destsAvailable.length) {
            startOrderDist.push(new google.maps.LatLng(lats[indexOfLowestDist], longs[indexOfLowestDist]));
            destsAvailable[indexOfLowestDist] = 0;
            start = false;
            repetitions = 0;
          }
        } else if (start == false) {
          if (repetitions < 1) {
            repetitions++;
            i = 0
          } else {
            i++;
          }
          document.getElementById("test").innerHTML += " added";
          var typeOfDestsEnd = typeof destsAvailable[i];
          if (typeOfDestsEnd != "undefined" || typeOfDestsEnd == "object") {
            if (i < destsAvailable.length) {
              //add to end array
              document.getElementById("test").innerHTML += " end " + i;
              //document.getElementById("test").innerHTML += " " + typeof endOrderDist[0];
              currentIndex = i;
              distService.getDistanceMatrix({
                  origins: [endOrderDist[0]],
                  destinations: [destsAvailable[i]],
                  travelMode: "DRIVING"
                  //avoidTolls: true,
                  //unitSystem: google.maps.UnitSystem.IMPERIAL
                }, callbackDist);
            } else {
              endOrderDist.unshift(new google.maps.LatLng(lats[indexOfLowestDist], longs[indexOfLowestDist]));
              destsAvailable[indexOfLowestDist] = 0;
              start = true;
              repetitions = 0;
            }
          }
        } else if (i >= destsAvailable.length) {
          endOrderDist.unshift(new google.maps.LatLng(lats[indexOfLowestDist], longs[indexOfLowestDist]));
          destsAvailable[indexOfLowestDist] = 0;
          start = true;
          repetitions = 0;
        }
      } else {
        clearInterval(orderEven);
      }



      /**if (destsAvailable.length > 0) {
        document.getElementById("test").innerHTML += " continue";
        if (start == true) {
          if (repetitions == 0) {
            repetitions++;
            i = 0;
          } else {
            i++;
          }
          if (i < destsAvailable.length) {
            currentIndex = i;
            //add to beginning array
            document.getElementById("test").innerHTML += " start " + i;
            document.getElementById("test").innerHTML += " " + typeof startOrderDist[startOrderDist.length - 1];
            distService.getDistanceMatrix({
                origins: [startOrderDist[startOrderDist.length - 1]],
                destinations: [destsAvailable[i]],
                travelMode: "DRIVING"
                //avoidTolls: true,
                //unitSystem: google.maps.UnitSystem.IMPERIAL
              }, callbackDist);
          } else {
            startOrderDist.push(destsAvailable[indexOfLowestDist]);
            destsAvailable.splice(indexOfLowestDist, 1);
            start = false;
            repetitions = 0;
          }
        } else if (start == false) {
          if (repetitions < 1) {
            repetitions++;
            i = 0
          } else {
            i++;
          }
          if (i < destsAvailable.length) {
            //add to end array
            document.getElementById("test").innerHTML += " end " + i;
            document.getElementById("test").innerHTML += " " + typeof endOrderDist[0];
            currentIndex = i;
            distService.getDistanceMatrix({
                origins: [endOrderDist[0]],
                destinations: [destsAvailable[i]],
                travelMode: "DRIVING"
                //avoidTolls: true,
                //unitSystem: google.maps.UnitSystem.IMPERIAL
              }, callbackDist);
          } else {
            var distanceObject = latlongs[indexOfLowestDist];
            //endOrderDist.unshift();
            document.getElementById("test").innerHTML += " " + distanceObject;
            endOrderDist.unshift(destsAvailable[indexOfLowestDist]);
            destsAvailable.splice(indexOfLowestDist, 1);
            start = true;
            repetitions = 0;
          }
        }
      } else {
        clearInterval(orderEven);
      }*/
    }, 1000);
    /**
    while (destsAvailable.length > 0) {
      //add to beginning array
      document.getElementById("test").innerHTML += " Start Loop ";
      for (var i = 0; i < destsAvailable.length; i++) {
        document.getElementById("test").innerHTML += " in loop ";
        //document.getElementById("test").innerHTML += " start ";
        distService.getDistanceMatrix({
            origins: [startOrderDist[startOrderDist.length - 1]],
            destinations: [destsAvailable[i]],
            travelMode: "DRIVING"
            //avoidTolls: true,
            //unitSystem: google.maps.UnitSystem.IMPERIAL
          }, callbackDist);
      }
      document.getElementById("test").innerHTML += " continue ";
      startOrderDist.push(destsAvailable[indexOfLowestDist]);
      destsAvailable.splice(indexOfLowestDist, 1);

      //add to end array
      for (var i = 0; i < destsAvailable.length; i++) {
        currentIndex = i;
        distService.getDistanceMatrix({
            origins: [endOrderDist[endOrderDist.length - 1]],
            destinations: [destsAvailable[i]],
            travelMode: "DRIVING"
            //avoidTolls: true,
            //unitSystem: google.maps.UnitSystem.IMPERIAL
          }, callbackDist);
      }
      endOrderDist.unshift(destsAvailable[indexOfLowestDist]);
      destsAvailable.splice(indexOfLowestDist, 1);
    }*/
  }



  //odd number of destinations
  if (numOfDests % 2 == 1) {
    //start and end coordinates
    var startEndCoords = new google.maps.LatLng(38.883149, -94.783762);

    //distance arrays
    startOrderDist.push(startEndCoords);
    endOrderDist.push(startEndCoords);

    repetitions = 0;
    start = true;
    var orderOdd = setInterval(function() {
      if (destsAvailable.length > 0) {
        if (destsAvailable.length > 1) {
          document.getElementById("test").innerHTML += " continue";
          if (start == true) {
            if (i == 0 && repetitions == 0) {
              repetitions++;
              i = 0;
            } else {
              i++;
            }
            if (i < destsAvailable.length) {
              currentIndex = i;
              //add to beginning array
              document.getElementById("test").innerHTML += " start " + i;
              distService.getDistanceMatrix({
                  origins: [startOrderDist[startOrderDist.length - 1]],
                  destinations: [destsAvailable[i]],
                  travelMode: "DRIVING"
                  //avoidTolls: true,
                  //unitSystem: google.maps.UnitSystem.IMPERIAL
                }, callbackDist);
            } else {
              startOrderDist.push(destsAvailable[indexOfLowestDist]);
              destsAvailable.splice(indexOfLowestDist, 1);
              start = false;
              i = 0;
              repetitions = 0;
            }
          } else if (start == false) {
            if (repetitions == 0) {
              repetitions++;
              i = 0;
            } else {
              i++;
            }
            if (i < destsAvailable.length) {
              //add to end array
              document.getElementById("test").innerHTML += " end " + i;
              currentIndex = i;
              distService.getDistanceMatrix({
                  origins: [endOrderDist[endOrderDist.length - 1]],
                  destinations: [destsAvailable[i]],
                  travelMode: "DRIVING"
                  //avoidTolls: true,
                  //unitSystem: google.maps.UnitSystem.IMPERIAL
                }, callbackDist);
            } else {
              endOrderDist.unshift(destsAvailable[indexOfLowestDist]);
              destsAvailable.splice(indexOfLowestDist, 1);
              start = true;
              repetitions = 0;
            }
          }
        } else {
          if (repetitions == 0) {
            currentIndex = 0;
            //add to beginning array
            document.getElementById("test").innerHTML += " start " + i;
            distService.getDistanceMatrix({
                origins: [startOrderDist[startOrderDist.length - 1]],
                destinations: [destsAvailable[0]],
                travelMode: "DRIVING"
                //avoidTolls: true,
                //unitSystem: google.maps.UnitSystem.IMPERIAL
              }, callbackDist);
            repetitions++;
          } else {
            startOrderDist.push(destsAvailable[indexOfLowestDist]);
            destsAvailable.splice(indexOfLowestDist, 1);
          }
        }
      } else {
        clearInterval(orderOdd);
      }
    }, 4000);

    /**while (destsAvailable.length > 0) {
      if (destsAvailable.length > 1) {
        //add to beginning array
        for (var i = 0; i < destsAvailable.length; i++) {
          currentIndex = i;
          distService.getDistanceMatrix({
              origins: [startOrderDist[startOrderDist.length - 1]],
              destinations: [destsAvailable[i]],
              travelMode: "DRIVING"
              //avoidTolls: true,
              //unitSystem: google.maps.UnitSystem.IMPERIAL
            }, callbackDist);
        }
        startOrderDist.push(destsAvailable[indexOfLowestDist]);
        destsAvailable.splice(indexOfLowestDist, 1);

        //add to end array
        for (var i = 0; i < destsAvailable.length; i++) {
          currentIndex = i;
          distService.getDistanceMatrix({
              origins: [endOrderDist[endOrderDist.length - 1]],
              destinations: [destsAvailable[i]],
              travelMode: "DRIVING"
              //avoidTolls: true,
              //unitSystem: google.maps.UnitSystem.IMPERIAL
            }, callbackDist);
        }
        endOrderDist.unshift(destsAvailable[indexOfLowestDist]);
        destsAvailable.splice(indexOfLowestDist, 1);
      } else if (destsAvailable.length == 1) {
        //add to beginning array
        for (var i = 0; i < destsAvailable.length; i++) {
          currentIndex = i;
          distService.getDistanceMatrix({
              origins: [startOrderDist[startOrderDist.length - 1]],
              destinations: [destsAvailable[i]],
              travelMode: "DRIVING"
              //avoidTolls: true,
              //unitSystem: google.maps.UnitSystem.IMPERIAL
            }, callbackDist);
        }
        startOrderDist.push(destsAvailable[indexOfLowestDist]);
        destsAvailable.splice(indexOfLowestDist, 1);
      }
    }*/
  }

  //combine both arrays into a single arrays
  for (var i = 0; i < startOrderDist.length; i++) {
    completedDistOrder.push(startOrderDist[i]);
  }
  for (var i = 0; i < endOrderDist.length; i++) {
    completedDistOrder.push(endOrderDist[i]);
  }
}

/**function findOrderOfDestinationsTime() {
  var numOfDests = destsAvailable.length;

  //start and end coordinates
  var startEndCoords = new google.maps.LatLng(38.883149, -94.783762);

  //reset and/or declare arrays
  startOrderTime = [];
  endOrderTime = [];

  //even number of destinations
  if (numOfDests % 2 == 0) {
    //distance arrays
    startOrderTime.push(startEndCoords);
    endOrderTime.push(startEndCoords);

    while (destsAvailable.length > 0) {
      //add to beginning array
      for (var i = 0; i < destsAvailable.length; i++) {
        currentIndex = i;
        distService.getDistanceMatrix({
            origins: [startOrderTime.length - 1],
            destinations: [destsAvailable[i]],
            avoidTolls: true,
            unitSystem: google.maps.UnitSystem.IMPERIAL
          }, callbackTime);
      }
      startOrderTime.push(destsAvailable[indexOfLowestTime]);
      destsAvailable.splice(indexOfLowestTime, 1);

      //add to end array
      for (var i = 0; i < destsAvailable.length; i++) {
        currentIndex = i;
        distService.getDistanceMatrix({
            origins: [endOrderTime.length - 1],
            destinations: [destsAvailable[i]],
            avoidTolls: true,
            unitSystem: google.maps.UnitSystem.IMPERIAL
          }, callbackTime);
      }
      endOrderTime.unshift(destsAvailable[indexOfLowestTime]);
      destsAvailable.splice(indexOfLowestTime, 1);
    }
  }

  //odd number of destinations
  if (numOfDests % 2 == 1) {
    //start and end coordinates
    var startEndCoords = new google.maps.LatLng(38.883149, -94.783762);

    //distance arrays
    startOrderTime.push(startEndCoords);
    endOrderTime.push(startEndCoords);

    while (destsAvailable.length > 0) {
      if (destsAvailable.length > 1) {
        //add to beginning array
        for (var i = 0; i < destsAvailable.length; i++) {
          currentIndex = i;
          distService.getDistanceMatrix({
              origins: [startOrderTime.length - 1],
              destinations: [destsAvailable[i]],
              avoidTolls: true,
              unitSystem: google.maps.UnitSystem.IMPERIAL
            }, callbackTime);
        }
        startOrderTime.push(destsAvailable[indexOfLowestTime]);
        destsAvailable.splice(indexOfLowestTime, 1);

        //add to end array
        for (var i = 0; i < destsAvailable.length; i++) {
          currentIndex = i;
          distService.getDistanceMatrix({
              origins: [endOrderTime.length - 1],
              destinations: [destsAvailable[i]],
              avoidTolls: true,
              unitSystem: google.maps.UnitSystem.IMPERIAL
            }, callbackTime);
        }
        document.getElementById("test").innerHTML += " | |_| | ";
        endOrderTime.unshift(destsAvailable[indexOfLowestTime]);
        destsAvailable.splice(indexOfLowestTime, 1);
      } else if (destsAvailable.length == 1) {
        //add to beginning array
        for (var i = 0; i < destsAvailable.length; i++) {
          currentIndex = i;
          distService.getDistanceMatrix({
              origins: [startOrderTime.length - 1],
              destinations: [destsAvailable[i]],
              avoidTolls: true,
              unitSystem: google.maps.UnitSystem.IMPERIAL
            }, callbackTime);
        }
        startOrderTime.push(destsAvailable[indexOfLowestTime]);
        destsAvailable.splice(indexOfLowestTime, 1);
      }
    }
  }

  //combine both arrays into a single arrays
  for (var i = 0; i < startOrderTime.length; i++) {
    completedTimeOrder.push(startOrderTime[i]);
  }
  for (var i = 0; i < endOrderTime.length; i++) {
    completedTimeOrder.push(endOrderTime[i]);
  }
}*/

function callbackDist(response, success) {
  var distanceResult = response.rows[0].elements[0].distance.value;

  document.getElementById("test").innerHTML += " in callback " + distanceResult;
  if (distanceResult < lowestDist) {
    lowestDist = distanceResult;
    indexOfLowestDist = currentIndex;
  }

  //document.getElementById("test").innerHTML += " " + currentIndex;
}

function callbackTime(response, success) {
  var time = response.rows[0].elements[0].duration.value;

  if (time < lowestTime) {
    lowestTime = time;
    indexOfLowestTime = currentIndex;
  }
}

function getDistDirections() {


  if (completedDistOrder.length > 23) {

  }
}

function directionCallback(response, success) {
  var directionResults;
}


document.getElementById("trigger-icon").addEventListener("click", function () {// open the distance box when clicking on find distance button
  document.getElementById("box").style.display = "block";
  if (document.getElementById("closeBtnD")) {
    document.getElementById("closeBtnD").click()// close search details box
  }
  if (AdPointer) {
    AdPointer.remove()
    AdPointer = null
  }
  let des, beg;
  let lgrp;
  
    document.getElementById("beginning").addEventListener("keydown", function () { // store beginning location
      if (event.key === 'Enter') {
        performSearch(this, "")
        .then((result) => {
          beg = {
            lat: parseFloat(result.lat),
            lon: parseFloat(result.lon),
          };
          console.log(beg);
          this.value = result.name;
          document.getElementById("search-results").remove();
          // You can now access the clicked result data here
        })
        .catch((error) => {
          console.error("Error fetching search results:", error);
        });
      }
      
  
   
    });

    document.getElementById("destination").addEventListener("keydown", function () { // store beginning location
      if (event.key === 'Enter') {
        performSearch(this, "")
      .then((result) => {
        des = {
          lat: parseFloat(result.lat),
          lon: parseFloat(result.lon),
        };
        console.log(des);
        this.value = result.name;
        document.getElementById("search-results").remove();
      
      })
      .catch((error) => {
        console.error("Error fetching search results:", error);
      });
      }
      
  
   
    });

  document.addEventListener("click", function (event) {// store point from map
    if (event.target.id == "beginning" || event.target.id == "destination") {
      focusedIn = document.activeElement;
    }
  });
  document.getElementById("fromMap").addEventListener("click", function () {// function to choose from map
    try {
      focusedIn.value = marker.getLatLng().lat + "," + marker.getLatLng().lng;
      let temp = {
        lat: marker.getLatLng().lat,
        lon: marker.getLatLng().lng,
      };
      if (focusedIn.id == "beginning") {
        beg = temp;
      } else {
        des = temp;
      }
    } catch (error) {
      alert(
        "click on the starting point or destination then select point on map"
      );
    }
  });
  document.getElementById("closeBtn").addEventListener("click", function () { //on closing of distance finder
    if (des) {
      delete des;
    }
    if (beg) {
      delete beg;
    }
    if (lgrp) {
      lgrp.remove();
    }
    document.getElementById("distanceResult").style.display = "none";
    document.getElementById("beginning").value = "";
    document.getElementById("destination").value = "";
    document.getElementById("box").style.display = "none";
  });
  document.getElementById("find").addEventListener("click", function () {// calculate the distance using valhalla
    let points = [beg, des];
    let route = FOSSGISValhallaEngine("route", "auto", points);
    route.getRoute(function (error, route) {
      if (!error) {
        // Add the route line to the map
        if (geoLayer != null) {
          geoLayer.remove();
          delete centre;
        }
        if (lgrp) {
          lgrp.remove();
        }
        lgrp = L.featureGroup();
        let path = L.polyline(route.line, { color: "blue" }).addTo(lgrp);
        console.log(path.getLatLngs()[path.getLatLngs().length - 1]);
        L.circleMarker(path.getLatLngs()[0], {
          fillColor: "red",
          stroke: false,
          fillOpacity: 1,
          radius: 5,
        }).addTo(lgrp);
        L.circleMarker(path.getLatLngs()[path.getLatLngs().length - 1], {
          fillColor: "green",
          stroke: false,
          fillOpacity: 1,
          radius: 5,
        }).addTo(lgrp);
        // Process route steps, distance, time, etc.
        lgrp.addTo(map);
        map.fitBounds(lgrp.getBounds());
        if (marker) {
          marker.remove();
        }
        //console.log('Steps:', route.steps);
        //console.log('Distance (meters):', route.distance);
        //console.log('Time (seconds):', route.time);
        var dist = new SpeechSynthesisUtterance();
        document.getElementById("dist").innerHTML = route.distance + " KM";
        if (route.time < 60) {
          document.getElementById("time").innerHTML = route.time + " Minutes";
          dist.text = 'Distance: ' + route.distance + " KM" + 'Time: ' + route.time + " Minutes";
        } else {
          let hrs = parseInt(route.time / 60);
          let min = route.time % 60;
          document.getElementById("time").innerHTML =
            hrs + " Hours " + min + " Minutes";
          dist.text = 'Distance: ' + route.distance + " KM" + 'Time: ' + hrs + " Hours " + min + " Minutes";
        }
        speechSynthesis.speak(dist);
        document.getElementById("distanceResult").style.display = "block";
      } else {

        if((document.getElementById("destination").value=='')||(document.getElementById("beginning").value=='')){
          alert("select places")
        }else{
          alert("You’re looking for places that are really far away. Try looking within a distance of 1500 kilometers instead.");
        }
      }
    });
  });
});
// routing engine(copied from OSM)
function FOSSGISValhallaEngine(id, costing, locations) {
  var INSTR_MAP = [
    0, // kNone = 0;
    8, // kStart = 1;
    8, // kStartRight = 2;
    8, // kStartLeft = 3;
    14, // kDestination = 4;
    14, // kDestinationRight = 5;
    14, // kDestinationLeft = 6;
    0, // kBecomes = 7;
    0, // kContinue = 8;
    1, // kSlightRight = 9;
    2, // kRight = 10;
    3, // kSharpRight = 11;
    4, // kUturnRight = 12;
    4, // kUturnLeft = 13;
    7, // kSharpLeft = 14;
    6, // kLeft = 15;
    5, // kSlightLeft = 16;
    0, // kRampStraight = 17;
    24, // kRampRight = 18;
    25, // kRampLeft = 19;
    24, // kExitRight = 20;
    25, // kExitLeft = 21;
    0, // kStayStraight = 22;
    1, // kStayRight = 23;
    5, // kStayLeft = 24;
    20, // kMerge = 25;
    10, // kRoundaboutEnter = 26;
    10, // kRoundaboutExit = 27;
    17, // kFerryEnter = 28;
    0, // kFerryExit = 29;
    null, // kTransit = 30;
    null, // kTransitTransfer = 31;
    null, // kTransitRemainOn = 32;
    null, // kTransitConnectionStart = 33;
    null, // kTransitConnectionTransfer = 34;
    null, // kTransitConnectionDestination = 35;
    null, // kPostTransitConnectionDestination = 36;
    21, // kMergeRight = 37;
    20, // kMergeLeft = 38;
  ];

  return {
    id: id,
    creditline:
      "<a href='https://gis-ops.com/global-open-valhalla-server-online/' target='_blank'>Valhalla (FOSSGIS)</a>",
    draggable: false,

    getRoute: function (callback) {
      return $.ajax({
        url: "https://valhalla1.openstreetmap.de/route",
        data: {
          json: JSON.stringify({
            locations: locations,
            costing: costing,
            directions_options: {
              units: "km",
            },
          }),
        },
        dataType: "json",
        success: function (data) {
          var trip = data.trip;

          if (trip.status === 0) {
            var line = [];
            var steps = [];
            var distance = 0;
            var time = 0;

            trip.legs.forEach(function (leg) {
              var legLine = L.PolylineUtil.decode(leg.shape, {
                precision: 6,
              });

              line = line.concat(legLine);

              leg.maneuvers.forEach(function (manoeuvre, idx) {
                var point = legLine[manoeuvre.begin_shape_index];

                steps.push([
                  { lat: point[0], lng: point[1] },
                  INSTR_MAP[manoeuvre.type],
                  "<b>" + (idx + 1) + ".</b> " + manoeuvre.instruction,
                  manoeuvre.length * 1000,
                  [],
                ]);
              });

              distance = distance + leg.summary.length;
              time = time + leg.summary.time;
            });

            callback(false, {
              line: line,
              steps: steps,
              distance: distance,
              time: parseInt(time / 60),
            });
          } else {
            callback(true);
          }
        },
        error: function () {
          callback(true);
        },
      });
    },
  };
}

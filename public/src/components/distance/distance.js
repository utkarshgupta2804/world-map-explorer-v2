
let des, beg;
let lgrp;
let box = document.getElementById("box");

document.getElementById("trigger-icon").addEventListener("click", function (e) {// open the distance box when clicking on find distance button
  box.style.display = "block";
  if (document.getElementById("closeBtnD")) {
    document.getElementById('searchdetails').style.display=="block" && document.getElementById("closeBtnD").click()// close search details box
  }
  if (AdPointer) {
    AdPointer.remove()
    AdPointer = null
  }
 successSound.play()
});    

function beginning() {
  let aaa = document.getElementById("beginning");  
  performSearch(aaa, "")
  .then((result) => {
    beg = {
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
    };
    console.log(beg);
    aaa.value = result.name;
    document.getElementById("search-results")?.remove();

    // You can now access the clicked result data here
  })
  .catch((error) => {
    console.error("Error fetching search results:", error);
  });
}
  document.getElementById("beginning").addEventListener("keydown", function () { // store beginning location
    if (event.key === 'Enter') {
     beginning()
    }
    

 
  });
  document.getElementById("b-searchbutton").addEventListener("click", () => { // store beginning location 
    beginning()
  });
  function destination() {
    let aaa = document.getElementById("destination");
    performSearch(aaa, "")
    .then((result) => {
      des = {
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon),
      };
      console.log(des);
      aaa.value = result.name;
      document.getElementById("search-results")?.remove();

    
    })
    .catch((error) => {
      console.error("Error fetching search results:", error);
    });
  }
  document.getElementById("destination").addEventListener("keydown", function () { // store beginning location
    if (event.key === 'Enter') {
      destination()
    }
    

 
  });
  document.getElementById("d-searchbutton").addEventListener("click", () => { // store beginning location
    destination()
  });
  document.getElementById("beginning").addEventListener("focus", function (event) {// store point from map
      focusedIn = document.activeElement;
  });
  document.getElementById("destination").addEventListener("focus", function (event) {// store point from map
    focusedIn = document.activeElement;
});
// document.addEventListener("click", function (event) {// store point from map
//   if (event.target.id == "beginning" || event.target.id == "destination") {
//     focusedIn = document.activeElement;
//   }
// });
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
    successSound.play()
  } catch (error) {
    alert(
      "focus on the starting point or destination then select point on map"
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
  closeSound.play()
  document.getElementById("distanceResult").style.display = "none";
  document.getElementById("beginning").value = "";
  document.getElementById("destination").value = "";
  box.style.display = "none";
});
document.getElementById("find").addEventListener("click", function () {// calculate the distance using valhalla
  document.getElementById("find").style.pointerEvents='none'
  document.getElementById("find").innerHTML = `<i class="fas fa-circle-notch fa-spin"></i>`
  document.getElementById("find").className =''
  let points = [beg, des];
  let route = FOSSGISValhallaEngine("route", "auto", points);
  route.getRoute(function (error, route) {
    document.getElementById("find").style.pointerEvents='auto'
  document.getElementById("find").innerHTML = ``
  document.getElementById("find").className ='fas fa-arrow-circle-right'
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
      updateLiveRegion(dist.text);
      document.getElementById("distanceResult").style.display = "block";
  
    } else {
      let error = JSON.parse(route.responseText)
      error.error_code == 130 ? alert("failed to parse locations Please ensure to select a valid location from suggessions") : alert(error.error);
      
    }
  });
  });
  


box.addEventListener("keydown", function (event) {
  if (event.altKey && event.key == 'l') {
    // Prevent default behavior if needed (e.g., avoid browser shortcuts)
    event.preventDefault();
    
    // Focus on the search bar element
    document.getElementById('fromMap')?.click() // Adjust the ID to match your HTML element
}
});




  
  // routing engine (copied from OSM)
  function FOSSGISValhallaEngine(id, costing, locations) {
    var INSTR_MAP = [
      0, 8, 8, 8, 14, 14, 14, 0, 0, 1, 2, 3, 4, 4, 7, 6, 5, 0, 24, 25, 24, 25, 0, 1, 5, 20, 10, 10, 17, 0, null, null, null, null, null, null, 21, 20,
    ];
  
    return {
      id: id,
      creditline: "<a href='https://gis-ops.com/global-open-valhalla-server-online/' target='_blank'>Valhalla (FOSSGIS)</a>",
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
              callback(true, { message: trip.status_message });
            }
          },
          error: function (xhr, status, error) {
            // Use this for a detailed error message
            callback(true, { responseText: xhr.responseText, statusText: status });
          },
        });
      },
    };
  }
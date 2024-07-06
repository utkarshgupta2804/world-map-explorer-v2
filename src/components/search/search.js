//var searchInput = document.getElementById('search-input');
var mapContainer = document.getElementById("map");
// Function to handle search and update results
function performSearch(inputField) {
  return new Promise((resolve, reject) => {
    var query = inputField.value.trim();
    if (query.length <= 2) {
      if (document.getElementById("search-results")) {
        document.getElementById("search-results").remove();
      }
    } else {
      document.addEventListener("click", function (event) {
        // Clear search results when the map is clicked
        if (
          !document
            .getElementById("search-input")
            .parentElement.contains(event.target)
        ) {
          if (document.getElementById("search-results")) {
            document.getElementById("search-results").remove();
          }
        }
      });
      let controllera;
      if (controllera) {
        controllera.abort();
      }
      controllera = new AbortController();
      const signal = controllera.signal;
      fetch(
        `https://nominatim.openstreetmap.org/search.php?q=${query}&format=jsonv2`,
        { signal }
      )
        .then((response) => response.json())
        .then((data) => {
          let ul = inputField.nextElementSibling;
          if (!ul || ul.tagName !== "UL") {
            ul = document.createElement("ul");
            ul.setAttribute("id", "search-results");
            inputField.parentNode.insertBefore(ul, inputField.nextSibling);
          }
          var searchResults = document.getElementById("search-results");
          searchResults.innerHTML = "";

          data.forEach((result) => {
            var li = document.createElement("li");
            li.innerHTML = '<span style="color: grey;display:flex;">'+result.type+'&nbsp</span>'+result.display_name;
            li.addEventListener("click", function () {
              // Update map view on selecting a result
              // map.setView([result.lat, result.lon], 13);

              resolve(result); // Resolve the promise with the clicked result
            });
            searchResults.appendChild(li);
          });
        })
        .catch((error) => reject(error)); // Reject the promise on errors
    }
  });
}
// Event listener for search input

document
  .getElementById("search-input")
  .addEventListener("input", function (event) {
    document.getElementById("closeBtn").click();
    performSearch(this)
      .then((result) => {
        geoJSON(result.osm_type, result.osm_id);
        document.getElementById("search-results").remove();
        //fetchDetails(result);
        //console.log(result)
        // You can now access the clicked result data here
      })
      .catch((error) => {
        console.error("Error fetching search results:", error);
      });

    // Event listener for map click
  });

var geoLayer = null;
async function geoJSON(type, id) {
  var result = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    // The body contains the query
    // to understand the query language see "The Programmatic Query Language" on
    // https://wiki.openstreetmap.org/wiki/Overpass_API#The_Programmatic_Query_Language_(OverpassQL)
    body:
      "data=" +
      encodeURIComponent(`
            [out:json][timeout:25];(${type}(${id}););out geom;`),
  }).then((data) => data.json());
  if (geoLayer != null) {
    geoLayer.remove();
    delete centre;
  } //removing if there any already
  /*if(result.elements[0].members){
        if(result.elements[0].members[result.elements[0].members.length-1].role=="label"){
            centre={
                lat: result.elements[0].members[result.elements[0].members.length-1].lat,
                lng: result.elements[0].members[result.elements[0].members.length-1].lon
            }
        }
    }*/
  result = osmtogeojson(result); //converting JSON to geoJSON
  //pname=result.features[0].properties.name
  let centre = turf.centerOfMass(result);
  //console.log(centre.geometry.coordinates)
  addmarker([centre.geometry.coordinates[1], centre.geometry.coordinates[0]]);

  //adding geoJSON to map
  geoLayer = L.geoJSON(result, {
    style: function (feature) {
      return {
        color: "red", // Border color
        fillColor: "yellow",
        fillOpacity: 0.5, // Adjust fill opacity as needed
      };
    },
    onEachFeature: function (feature, layer) {
      if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent);
      }
    },
  });
  await map.fitBounds(geoLayer.getBounds()); //aligning the added layer to centre of the map

  /*if(typeof centre!='undefined'){
        addmarker(centre)
    }else{
        addmarker(map.getCenter());
    }*/
  setTimeout(() => {
    geoLayer.addTo(map);
  }, 500); //dont change this
}


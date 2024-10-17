//var searchInput = document.getElementById('search-input');
var mapContainer = document.getElementById("map");
var placeids = []
let i = 0
let active = -1
const osmIds = [307573, 270056, 153310, 2748339, 2748436, 1997914, 153292];
const bbox = L.latLngBounds(
  L.latLng(31.579199916145, 71.366088444458),  // Southwest corner (minLat, minLon)
  L.latLng(37.596155337118,80.442480694206)   // Northeast corner (maxLat, maxLon)
);

var ser = document.querySelector(".box-input")
const successSound= new Audio('sucessfull.mp3')
 function keyboardselect(e){
  if (e.keyCode == 40) {
    if (active < this.querySelector("#search-results").children.length-1) {
      active++
      this.querySelector("#search-results").children[active].focus()
    }
  }else if(e.keyCode == 38){
    if (active > 0) {
      active--
      this.querySelector("#search-results").children[active].focus()
    }
  }else if(e.keyCode == 13){
    this.querySelector("#search-results").children[active]?.click()

  }
}
document.addEventListener("click", function (event) {
  if(document.getElementById("search-results")){
    if (
      !(event.target.closest(".box-input") || event.target.closest("#search-results"))
    ) {
      document.getElementById("search-results").parentElement.removeEventListener('keydown', keyboardselect)

        document.getElementById("search-results").remove();
    }
  }
  
});
// Function to handle search and update results
function performSearch(inputField, placeid) {

  return new Promise((resolve, reject) => {
    active = -1
    var query = inputField.value.trim();
    if (query.length <= 2) {
      if (document.getElementById("search-results")) {
      document.getElementById("search-results").parentElement.removeEventListener('keydown', keyboardselect)

        document.getElementById("search-results").remove();
      }
    } else {
      
      
      if (placeid == "") { //for removing already shown
        placeids = []
        i = 0
      }
      let controllera;
      if (controllera) {
        controllera.abort();
      }
      controllera = new AbortController();
      const signal = controllera.signal;
      let ul = inputField.nextElementSibling;
      if (!ul || ul.tagName !== "UL") {
        ul = document.createElement("ul");
        ul.setAttribute("id", "search-results");
        ul.setAttribute("tabindex", "7");
        ul.setAttribute("aria-label", "select your result");
        inputField.parentElement.parentNode.insertBefore(ul, inputField.parentNode.nextSibling);
      }


    
      var searchResults = document.getElementById("search-results");


searchResults.parentElement.addEventListener('keydown', keyboardselect)
      searchResults.innerHTML = '<li style="justify-content: center;"><i class="fas fa-circle-notch fa-spin"></i></li>'
      //searchResults.appendChild(det)
      Loadinginterval = setInterval(notifyLoading, 2000);
      fetch(
        `https://nominatim.openstreetmap.org/search.php?q=${query}&format=jsonv2&exclude_place_ids=${placeid}`,
        { signal }
      )
        .then((response) => response.json())
        .then((data) => {

          clearInterval(Loadinginterval)
          //    searchResults.focus()
          successSound.play()
          updateLiveRegion("select from result")
          searchResults.innerHTML = "";
          console.log(data.length)
          data.forEach((result) => {
            var li = document.createElement("li");
            li.innerHTML =
              '<span style="color: grey;display:flex;">' +
              result.type + // display result type
              "&nbsp</span>" +
              result.display_name; // display name
            placeids[i] = result.place_id
            i++
            li.addEventListener("click", function () {
              // Update map view on selecting a result

              resolve(result); // Resolve the promise with the clicked result
            });
            li.setAttribute("aria-atom", `"${result.display_name}"`)
            li.setAttribute("tabindex", "1")
            searchResults.appendChild(li);

          });
          if (data.length == 0) {
            var li = document.createElement("li");
            li.innerHTML = "No result found"
            searchResults.appendChild(li);

          } else {
            var li = document.createElement("li");
            li.innerHTML = "More results"
            li.setAttribute("tabindex", "1")
            li.addEventListener("click", function () {
      document.getElementById("search-results").parentElement.removeEventListener('keydown', keyboardselect)

            document.getElementById("search-results").remove();

              performSearch(inputField, placeids.toString()).then((result) => {
                resolve(result)
              })
              searchResults.scrollTop = 0;

            });
            searchResults.appendChild(li);

          }
        })
        .catch((error) => reject(error))
        .finally(()=>{
          searchResults.focus()
        }); // Reject the promise on errors
    }
  });
}
// Event listener for search input




//const dropdownToggle = document.querySelector('.dropdown-toggle')





function mainsearchbar(){
  if(document.getElementById("search-results")){
    document.getElementById("search-results").parentElement.removeEventListener('keydown', keyboardselect)
    document.getElementById("search-results").remove();
  }
  performSearch(document.getElementById("search-input"), "")
      .then((result) => {
        placeappear(result) // Call fetchDetails with the clicked result
        //console.log(result)
        // You can now access the clicked result data here
      })
      .catch((error) => {
        console.error("Error fetching search results:", error);
      });
}


document.getElementById("search-input").addEventListener('keydown', (event) => {
  if (event.key === 'Enter') { // Check if the Enter key was pressed
    //event.preventDefault();  // Prevent the default form submission (if needed)
    //console.log(this)
    mainsearchbar()

  }
});
document.getElementById("searchbutton").addEventListener('click', function(e){
  mainsearchbar()

})
// document
//   .getElementById("search-input")
//   .addEventListener("input", function (event) {
//     document.getElementById("closeBtn").click();
//     performSearch(this, "")
//       .then((result) => {
//         placeappear(result) // Call fetchDetails with the clicked result
//         //console.log(result)
//         // You can now access the clicked result data here
//       })
//       .catch((error) => {
//         console.error("Error fetching search results:", error);
//       });

//     // Event listener for map click
//   });

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

  result = osmtogeojson(result); //converting JSON to geoJSON
  if (result.features[0].properties.name === "India") {
    result = await fetchindia();
}
  osmIds.forEach((value)=>{ // deduct kashmir parts from china and pak
    if (value==id){
      result = turf.difference(result.features[0], Kashmir.features[0]);
    }
  })
  let centre = turf.centerOfMass(result);
centre =L.latLng([centre.geometry.coordinates[1], centre.geometry.coordinates[0]])
  addmarker(centre);
  console.log(result)

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


  setTimeout(() => {
    geoLayer.addTo(map);
    place = geoLayer.toGeoJSON()
  }, 500); //dont change this, time lagg to wait for completing map movement
}

//by athul
async function fetchDetails(result) {
  const { osm_type, osm_id, display_name } = result;
  const adminLevelQuery = `
      [out:json];
      ${osm_type}(${osm_id});
      out tags;
  `;
  const adminLevelResult = await fetch(
    "https://overpass-api.de/api/interpreter",
    {
      method: "POST",
      body: `data=${encodeURIComponent(adminLevelQuery)}`,
    }
  ).then((response) => response.json());

  const tags = adminLevelResult.elements[0].tags;
  const adminLevel = parseInt(tags["admin_level"]);

  if (adminLevel <= 2) {
    return fetchCountryDetails(display_name, osm_type, osm_id);
  } else if (adminLevel == 4 || adminLevel == 3) {
    return fetchStateDetails(display_name, osm_type, osm_id);
  } else if (adminLevel == 5) {
    return fetchDistrictDetails(display_name, osm_type, osm_id);
  } else if (tags["type"] === "waterway" || tags["waterway"] === "river") {
    return fetchRiverDetails(osm_type, osm_id, tags, result);
  } else {
    return fetchOtherDetails(tags, result)
  }
}

async function fetchCountryDetails(displayName, osm_type, osm_id) {
  const countryQuery = `
      [out:json];
      ${osm_type}(${osm_id});
      out tags center;
  `;

  const result = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: `data=${encodeURIComponent(countryQuery)}`,
  }).then((response) => response.json());

  const country = result.elements[0];
  const tags = country.tags;
  const center = country.center;

  const roundedLat = center.lat.toFixed(4);
  const roundedLon = center.lon.toFixed(4);

  // Fetch summary from Wikipedia API
  const wikipediaUrl = `https://en.wikipedia.org/w/api.php?action=query&origin=*&format=json&titles=${displayName}&prop=extracts|info&exintro&explaintext&inprop=url`;
  const wikipediaResult = await fetch(wikipediaUrl).then((response) =>
    response.json()
  );

  const pages = wikipediaResult.query.pages;
  const pageId = Object.keys(pages)[0];
  const page = pages[pageId];

  /* if (page.extract) {
      console.log(`Summary: ${page.extract}`);
  } else {
      console.log('No summary available.');
  }*/
  // Fetch Wikidata entity ID using the Wikipedia title
  const wikidataEntityUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&origin=*&format=json&sites=enwiki&titles=${displayName}`;
  const wikidataEntityResult = await fetch(wikidataEntityUrl).then((response) =>
    response.json()
  );
  const entity = Object.values(wikidataEntityResult.entities)[0];
  const entityId = entity.id;
  // Fetch additional details from Wikidata using the entity ID
  const wikidataDetailsUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&origin=*&format=json&ids=${entityId}&props=claims`;
  const wikidataDetailsResult = await fetch(wikidataDetailsUrl).then(
    (response) => response.json()
  );
  const claims = wikidataDetailsResult.entities[entityId].claims;
  const details = {
    capital: "",
    continent: "",
    language: "",
    population: "",
    borders: "",
    easternmostPoint: "",
    westernmostPoint: "",
    northernmostPoint: "",
    southernmostPoint: "",
  };
  const getClaimValue = (claim) => {
    if (claim && claim.mainsnak && claim.mainsnak.datavalue) {
      return claim.mainsnak.datavalue.value;
    }
    return null;
  };

  //Fetching capital
  if (claims.P36) {
    const capitalClaims = claims.P36;
    let latestCapitalClaim = capitalClaims[0];

    capitalClaims.forEach((claim) => {
      if (claim.rank === 'preferred') {
        latestCapitalClaim = claim;
      }
    });

    const capitalClaim = getClaimValue(latestCapitalClaim);

    if (capitalClaim && capitalClaim.id) {
      const capitalDetails = await fetch(
        `https://www.wikidata.org/wiki/Special:EntityData/${capitalClaim.id}.json`
      ).then((res) => res.json());

      const entityId = Object.keys(capitalDetails.entities)[0];
      const capitalName = capitalDetails.entities[entityId].labels.en.value;

      details.capital = capitalName;
    }
  }

  // Fetching continent
  if (claims.P30) {
    const continentClaim = getClaimValue(claims.P30[0]);
    if (continentClaim && continentClaim.id) {
      const continentDetails = await fetch(
        `https://www.wikidata.org/wiki/Special:EntityData/${continentClaim.id}.json`
      ).then((res) => res.json());
      details.continent =
        continentDetails.entities[continentClaim.id].labels.en.value;
    }
  }

  // Fetching official languages
  if (claims.P37) {
    details.language = await Promise.all(
      claims.P37.map(async (language) => {
        const languageClaim = getClaimValue(language);
        if (languageClaim && languageClaim.id) {
          const languageDetails = await fetch(
            `https://www.wikidata.org/wiki/Special:EntityData/${languageClaim.id}.json`
          ).then((res) => res.json());
          return languageDetails.entities[languageClaim.id].labels.en.value;
        }
        return "";
      })
    ).then((languages) => languages.filter(Boolean).join(", "));
  }

  // Fetching population
  if (claims.P1082) {
    const populationClaim = getClaimValue(claims.P1082[0]);
    if (populationClaim) {
      details.population = populationClaim.amount;
    }
  }

  // Fetching borders
  if (claims.P47) {
    details.borders = await Promise.all(
      claims.P47.map(async (border) => {
        const borderClaim = getClaimValue(border);
        if (borderClaim && borderClaim.id) {
          const borderDetails = await fetch(
            `https://www.wikidata.org/wiki/Special:EntityData/${borderClaim.id}.json`
          ).then((res) => res.json());
          return borderDetails.entities[borderClaim.id].labels.en.value;
        }
        return "";
      })
    ).then((borders) => borders.filter(Boolean).join(", "));
  }

  // Fetching coordinates
  if (claims.P1332) {
    const coordinateClaim = claims.P1332[0].mainsnak.datavalue.value;
    if (coordinateClaim) {
      const longitude = coordinateClaim.longitude.toFixed(3);
      const latitude = coordinateClaim.latitude.toFixed(3);
      details.northernmostPoint = `Lon :${longitude} , Lat :${latitude}`;
    }
  }
  if (claims.P1333) {
    const coordinateClaim = claims.P1333[0].mainsnak.datavalue.value;
    if (coordinateClaim) {
      const longitude = coordinateClaim.longitude.toFixed(3);
      const latitude = coordinateClaim.latitude.toFixed(3);
      details.southernmostPoint = `Lon :${longitude} , Lat :${latitude}`;
    }
  }
  if (claims.P1334) {
    const coordinateClaim = claims.P1334[0].mainsnak.datavalue.value;
    if (coordinateClaim) {
      const longitude = coordinateClaim.longitude.toFixed(3);
      const latitude = coordinateClaim.latitude.toFixed(3);
      details.easternmostPoint = `Lon :${longitude} , Lat :${latitude}`;
    }
  }
  if (claims.P1335) {
    const coordinateClaim = claims.P1335[0].mainsnak.datavalue.value;
    if (coordinateClaim) {
      const longitude = coordinateClaim.longitude.toFixed(3);
      const latitude = coordinateClaim.latitude.toFixed(3);
      details.westernmostPoint = `Lon :${longitude} , Lat :${latitude}`;
    }
  }

  return `
  <h2>${displayName}</h2>
  <h3>Main Details</h3>
  <ul><li>Capital: ${details.capital}</li>
  <li>Continent: ${details.continent}</li>
  <li>Coordinates: ${roundedLat}, ${roundedLon}</li></ul>
 
  <h3>Additional Details</h3>
  <ul><li>Language(s): ${details.language}</li>
  <li>Population: ${details.population}</li>
  <li>Borders: ${details.borders}</li></ul>
   <h5>Bounding Coordinates</h5>
  <ul><li>North-most: ${details.northernmostPoint} <li>
  <li>South-most: ${details.southernmostPoint} </li>
  <li>East-most: ${details.easternmostPoint} </li>
  <li>West-most: ${details.westernmostPoint} </li></ul>
`;

}

async function fetchStateDetails(displayName, osm_type, osm_id) {
  const stateQuery = `
      [out:json];
      ${osm_type}(${osm_id});
      out tags center;
  `;

  const result = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: `data=${encodeURIComponent(stateQuery)}`,
  }).then((response) => response.json());

  const state = result.elements[0];
  const tags = state.tags;
  const center = state.center;

  const roundedLat = center.lat.toFixed(4);
  const roundedLon = center.lon.toFixed(4);

  const wikidataTag = tags.wikidata;
  if (wikidataTag) {
    const wikidataEntityId = wikidataTag;

    // Fetch additional details from Wikidata using the entity ID
    const wikidataDetailsUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&origin=*&format=json&ids=${wikidataEntityId}&props=claims|descriptions`;
    const wikidataDetailsResult = await fetch(wikidataDetailsUrl).then(
      (response) => response.json()
    );

    if (
      wikidataDetailsResult.entities &&
      wikidataDetailsResult.entities[wikidataEntityId]
    ) {
      const entity = wikidataDetailsResult.entities[wikidataEntityId];
      const claims = entity.claims;
      const descriptions = entity.descriptions;

      const details = {
        country: "",
        capital: "",
        coordinates: `${center.lat}, ${center.lon}`,
        borders: [],
        summary:
          descriptions && descriptions.en
            ? descriptions.en.value
            : "No summary available.",
      };

      // Fetch country
      if (claims.P17) {
        const countryId = claims.P17[0].mainsnak.datavalue.value.id;
        const countryDetails = await fetch(
          `https://www.wikidata.org/wiki/Special:EntityData/${countryId}.json`
        ).then((res) => res.json());
        details.country = countryDetails.entities[countryId].labels.en.value;
      }

      // Fetch capital
      if (claims.P36) {
        // Property for capital city
        const capitalId = claims.P36[0].mainsnak.datavalue.value.id;
        const capitalDetails = await fetch(
          `https://www.wikidata.org/wiki/Special:EntityData/${capitalId}.json`
        ).then((res) => res.json());
        details.capital = capitalDetails.entities[capitalId].labels.en.value;
      } else if (claims.P1376) {
        // Property for administrative territorial entity
        const capitalId = claims.P1376[0].mainsnak.datavalue.value.id;
        const capitalDetails = await fetch(
          `https://www.wikidata.org/wiki/Special:EntityData/${capitalId}.json`
        ).then((res) => res.json());
        details.capital = capitalDetails.entities[capitalId].labels.en.value;
      }

      // Fetch borders
      if (claims.P47) {
        details.borders = await Promise.all(
          claims.P47.map(async (border) => {
            const borderId = border.mainsnak.datavalue.value.id;
            const borderDetails = await fetch(
              `https://www.wikidata.org/wiki/Special:EntityData/${borderId}.json`
            ).then((res) => res.json());
            return borderDetails.entities[borderId].labels.en.value;
          })
        );
      }

      return `
          <h2>${displayName}</h2>
          <h3>Main Details</h3>
          <ul>
          <li>Country: ${details.country}</li>
          <li>Capital: ${details.capital}</li>
          <li>Coordinates: ${roundedLat}, ${roundedLon}</li>
          </ul>
          <h3>Additional Details</h3>
          <ul>
          <li>Borders: ${details.borders.join(", ")}</li>
          <li>Summery: ${details.summary}</li></ul>
          `;
    } else {
      console.log("No valid Wikidata entity found for the provided ID.");
    }
  } else {
    console.log("No Wikidata ID found for this state.");
  }
}

async function fetchDistrictDetails(displayName, osm_type, osm_id) {
  const districtQuery = `
      [out:json];
      ${osm_type}(${osm_id});
      out tags center;
  `;

  const result = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: `data=${encodeURIComponent(districtQuery)}`,
  }).then((response) => response.json());

  const district = result.elements[0];
  const tags = district.tags;
  const center = district.center;

  const roundedLat = center.lat.toFixed(4);
  const roundedLon = center.lon.toFixed(4);

  const wikidataTag = tags.wikidata;
  if (wikidataTag) {
    const wikidataEntityId = wikidataTag;

    // Fetch additional details from Wikidata using the entity ID
    const wikidataDetailsUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&origin=*&format=json&ids=${wikidataEntityId}&props=claims|descriptions`;
    const wikidataDetailsResult = await fetch(wikidataDetailsUrl).then(
      (response) => response.json()
    );

    if (
      wikidataDetailsResult.entities &&
      wikidataDetailsResult.entities[wikidataEntityId]
    ) {
      const entity = wikidataDetailsResult.entities[wikidataEntityId];
      const claims = entity.claims;
      const descriptions = entity.descriptions;

      const details = {
        state: "",
        coordinates: `${center.lat}, ${center.lon}`,
        borders: [],
        summary:
          descriptions && descriptions.en
            ? descriptions.en.value
            : "No summary available.",
      };

      // Fetch state (if aplicable for the district)
      if (claims.P131) {
        // Property for located in the administrative territorial entity
        const stateId = claims.P131[0].mainsnak.datavalue.value.id;
        const stateDetails = await fetch(
          `https://www.wikidata.org/wiki/Special:EntityData/${stateId}.json`
        ).then((res) => res.json());
        details.state = stateDetails.entities[stateId].labels.en.value;
      }

      // Fetch borders (if available)
      if (claims.P47) {
        details.borders = await Promise.all(
          claims.P47.map(async (border) => {
            const borderId = border.mainsnak.datavalue.value.id;
            const borderDetails = await fetch(
              `https://www.wikidata.org/wiki/Special:EntityData/${borderId}.json`
            ).then((res) => res.json());
            return borderDetails.entities[borderId].labels.en.value;
          })
        );
      }

      return `
          <h2>${displayName}</h2>
          <h3>Main Details</h3>
          <p>State: ${details.state}</p>
          <p>Coordinates: ${roundedLat}, ${roundedLon}</p>
          <h3>Additional Details</h3>
          <p>Borders: ${details.borders.join(", ")}</p>
          <p>Summery: ${details.summary}</p>
          `;
      // Display in searchdetails box

    } else {
      return `<h3>No valid Wikidata entity found for the provided ID.</h3>`
    }
  } else {
    return `<h3>No valid Wikidata entity found for the provided ID.</h3>`

  }
}

async function fetchOtherDetails(tags, result) {
  let prefix = await fetchPrefix(tags);

  let data = `
    <h3>Details</h3>
    <ul>
    <li>Name : ${result.name}</li>
    <li>Type : ${(prefix != "") ? prefix : result.type}</li>
    <li>Address : ${result.display_name}</li></ul>
    `;
  return data;
}

async function fetchPrefix(result) {
  var tags = result;
  var prefix = "";

  const response = await fetch("src/components/search/prefix.json");
  const data = await response.json();

  if (tags.boundary === "administrative" && tags.admin_level) {
    prefix = data.prefix.admin_levels["level" + tags.admin_level];
  } else {
    var prefixes = data.prefix;
    var key, value;
    for (key in tags) {
      value = tags[key];

      if (prefixes[key]) {
        if (prefixes[key][value]) {
          return prefixes[key][value];
        }
      }
    }
    for (key in tags) {
      value = String(tags[key]);

      if (prefixes[key]) {
        var first = value.slice(0, 1).toUpperCase(); // Remove (...) from slice
        var rest = value.slice(1).replace(/_/g, " ");

        return first + rest;
        return first + rest;
      }
    }
  }
  return prefix;
}

async function fetchRiverDetails(osm_type, osm_id, tagsa, resulta) {
  const riverQuery = `
      [out:json];
      ${osm_type}(${osm_id});
      out tags center;
  `;

  const result = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: `data=${encodeURIComponent(riverQuery)}`,
  }).then((response) => response.json());

  const river = result.elements[0];
  const tags = river.tags;
  const center = river.center;
  const riverName = tags.name || "Unnamed River";
  const wikidataTag = tags.wikidata;
  if (wikidataTag) {
    const wikidataEntityId = wikidataTag;
    try {
      const wikidataDetailsUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&origin=*&format=json&ids=${wikidataEntityId}&props=claims|descriptions`;
      const wikidataDetailsResult = await fetch(wikidataDetailsUrl).then(
        (response) => response.json()
      );
      if (
        wikidataDetailsResult.entities &&
        wikidataDetailsResult.entities[wikidataEntityId]
      ) {
        const entity = wikidataDetailsResult.entities[wikidataEntityId];
        const claims = entity.claims;
        const descriptions = entity.descriptions;
        const details = {
          name: riverName,
          origin: "",
          mouth: "",
          tributaries: [],
          length: "",
          summary:
            descriptions && descriptions.en
              ? descriptions.en.value
              : "No summary available.",
        };
        // Fetch origin (source of the river)
        if (claims.P885) {
          // Property for source of watercourse
          const originId = claims.P885[0].mainsnak.datavalue.value.id;
          const originDetails = await fetch(
            `https://www.wikidata.org/wiki/Special:EntityData/${originId}.json`
          ).then((res) => res.json());
          details.origin = originDetails.entities[originId].labels.en.value;
        }
        // Fetch mouth
        if (claims.P403) {
          // Property for mouth of the watercourse
          const mouthId = claims.P403[0].mainsnak.datavalue.value.id;
          const mouthDetails = await fetch(
            `https://www.wikidata.org/wiki/Special:EntityData/${mouthId}.json`
          ).then((res) => res.json());
          details.mouth = mouthDetails.entities[mouthId].labels.en.value;
        }
        // Fetch tributaries
        if (claims.P974) {
          // Property for tributaries
          details.tributaries = await Promise.all(
            claims.P974.map(async (tributary) => {
              const tributaryId = tributary.mainsnak.datavalue.value.id;
              const tributaryDetails = await fetch(
                `https://www.wikidata.org/wiki/Special:EntityData/${tributaryId}.json`
              ).then((res) => res.json());
              return tributaryDetails.entities[tributaryId].labels.en.value;
            })
          );
        }
        // Fetch length
        if (claims.P2043) {
          // Property for length
          const lengthValue = claims.P2043[0].mainsnak.datavalue.value.amount;
          details.length = `${lengthValue} Kilo meter`;
        }
        return `<h3>River Details</h3>
              <ul>
              <li>Name: ${details.name}</li>
              <li>Length: ${details.length}</li>
              <li>Origin: ${details.origin}</li>
              <li>Mouth: ${details.mouth}</li>
              <li>Tributaries: ${details.tributaries.join(", ")}</li>
              </ul>
              `;
        // Display in searchdetails box
      } else {
        otherdata = await fetchOtherDetails(tagsa, resulta)

        return `${otherdata}<h3>No valid Wikidata entity found for the provided ID.</h3>`

      }
    } catch (error) {
      otherdata = await fetchOtherDetails(tagsa, resulta)

      return `${otherdata}<h3>Error fetching Wikidata details: ${error}</h3>`
    }
  } else {
    otherdata = await fetchOtherDetails(tagsa, resulta)

    return `${otherdata}<h3>No valid Wikidata entity found for the river.</h3>`

  }
}
//clearing searchdetails box when not in use
// function clearSearchDetails() {
//   document.getElementById("searchdetails").style.display = "none";
//   document.getElementById("searchdetails").innerHTML = "";
// }
document.getElementById("closeBtnD").addEventListener('click', function () {
  closeSound.play()
  document.getElementById("searchdetails").style.display = "none";
  if (geoLayer != null) {
    geoLayer.remove();
    delete centre;
  }
  //document.getElementById("searchdetails").innerHTML = "";

})
async function placeappear(result) {
  geoJSON(result.osm_type, result.osm_id);
  if (document.getElementById("search-results")) {
    document.getElementById("search-results").parentElement.removeEventListener('keydown', keyboardselect)
    document.getElementById("search-results").remove();
  }
  let det = document.getElementById("det")
  det.parentElement.style.display = "block"
  det.innerHTML = '<h2 style="padding:50px; text-align: center; justify-content: center; align-items: center;"><i class="fas fa-circle-notch fa-spin"></h2>'
  Loadinginterval = setInterval(notifyLoading, 2000);
  details = fetchDetails(result).then(async data => {
    successSound.play()
    updateLiveRegion("details ready")
    
    if(await isInindiaKashmir(result)){
      det.innerHTML='No data found for this region'
    }else{
      det.innerHTML=data
    }
    det.focus()

  }).catch((error)=>{
    console.error(error)
  }).finally(()=>{
    clearInterval(Loadinginterval)
  })
}

async function isInindiaKashmir(result){
  if(bbox.contains(marker.getLatLng())){
    const addressData = await fetch(`https://nominatim.openstreetmap.org/details.php?osmtype=${result.osm_type.trim().charAt(0).toUpperCase()}&osmid=${result.osm_id}&addressdetails=1&format=json`)
.then(response => response.json());

    if((leafletPip.pointInLayer(marker.getLatLng(), L.geoJson(Kashmir)).length > 0) && addressData.country_code!='in'){ //make no data for pak-kasmir
      return true
    }else{
      return false
    }
  }else{
    return false
  }
}
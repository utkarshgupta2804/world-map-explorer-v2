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
        fetchDetails(result); // Call fetchDetails with the clicked result
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

//by athul
async function fetchDetails(result) {
  const { osm_type, osm_id, display_name } = result;
  const adminLevelQuery = `
      [out:json];
      ${osm_type}(${osm_id});
      out tags;
  `;
  const adminLevelResult = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: `data=${encodeURIComponent(adminLevelQuery)}`
  }).then(response => response.json());

  const tags = adminLevelResult.elements[0].tags;
  const adminLevel = parseInt(tags['admin_level']);

  if (adminLevel <= 2) {
      fetchCountryDetails(display_name, osm_type, osm_id);
  } else if (adminLevel == 4) {
      fetchStateDetails(display_name, osm_type, osm_id);
  } else if (adminLevel == 5 ) {
      fetchDistrictDetails(display_name, osm_type, osm_id);
  }else if(!(tags['type'] === 'waterway' || (tags['waterway'] === 'river'))) {
      fetchOtherDetails(tags, result);
  }else if(tags['type'] === 'waterway' ||  tags['waterway'] === 'river'){
      fetchRiverDetails(osm_type, osm_id);
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
      body: `data=${encodeURIComponent(countryQuery)}`
  }).then(response => response.json());

  const country = result.elements[0];
  const tags = country.tags;
  const center = country.center;

  const roundedLat = center.lat.toFixed(4);
  const roundedLon = center.lon.toFixed(4);

  // Fetch summary from Wikipedia API
  const wikipediaUrl = `https://en.wikipedia.org/w/api.php?action=query&origin=*&format=json&titles=${displayName}&prop=extracts|info&exintro&explaintext&inprop=url`;
  const wikipediaResult = await fetch(wikipediaUrl).then(response => response.json());

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
  const wikidataEntityResult = await fetch(wikidataEntityUrl).then(response => response.json());
  const entity = Object.values(wikidataEntityResult.entities)[0];
  const entityId = entity.id;
  // Fetch additional details from Wikidata using the entity ID
  const wikidataDetailsUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&origin=*&format=json&ids=${entityId}&props=claims`;
  const wikidataDetailsResult = await fetch(wikidataDetailsUrl).then(response => response.json());
  const claims = wikidataDetailsResult.entities[entityId].claims;
  const details = {
      capital: '',
      continent: '',
      language: '',
      population: '',
      borders: ''
  };
   const getClaimValue = (claim) => {
      if (claim && claim.mainsnak && claim.mainsnak.datavalue) {
          return claim.mainsnak.datavalue.value;
      }
      return null;
  };

  // Fetching capital
  if (claims.P36) {
      const capitalClaim = getClaimValue(claims.P36[0]);
      if (capitalClaim && capitalClaim.id) {
          const capitalDetails = await fetch(`https://www.wikidata.org/wiki/Special:EntityData/${capitalClaim.id}.json`).then(res => res.json());
          details.capital = capitalDetails.entities[capitalClaim.id].labels.en.value;
      }
  }

  // Fetching continent
  if (claims.P30) {
      const continentClaim = getClaimValue(claims.P30[0]);
      if (continentClaim && continentClaim.id) {
          const continentDetails = await fetch(`https://www.wikidata.org/wiki/Special:EntityData/${continentClaim.id}.json`).then(res => res.json());
          details.continent = continentDetails.entities[continentClaim.id].labels.en.value;
      }
  }

  // Fetching official languages
  if (claims.P37) {
      details.language = await Promise.all(claims.P37.map(async language => {
          const languageClaim = getClaimValue(language);
          if (languageClaim && languageClaim.id) {
              const languageDetails = await fetch(`https://www.wikidata.org/wiki/Special:EntityData/${languageClaim.id}.json`).then(res => res.json());
              return languageDetails.entities[languageClaim.id].labels.en.value;
          }
          return '';
      })).then(languages => languages.filter(Boolean).join(', '));
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
      details.borders = await Promise.all(claims.P47.map(async border => {
          const borderClaim = getClaimValue(border);
          if (borderClaim && borderClaim.id) {
              const borderDetails = await fetch(`https://www.wikidata.org/wiki/Special:EntityData/${borderClaim.id}.json`).then(res => res.json());
              return borderDetails.entities[borderClaim.id].labels.en.value;
          }
          return '';
      })).then(borders => borders.filter(Boolean).join(', '));
  }
  
  let htmlContent = `
  <h2>Name: ${displayName}</h2>
  <h3>Main Details</h3>
  <p>Capital: ${details.capital}</p>
  <p>Continent: ${details.continent}</p>
  <p>Coordinates: ${roundedLat}, ${roundedLon}</p> 
  <h3>Additional Details</h3>
  <p>Language(s): ${details.language}</p>
  <p>Population: ${details.population}</p>
  <p>Borders: ${details.borders}</p>
`;
console.log(`Name: ${displayName}`);
console.log(`Coordinates: ${roundedLat}, ${roundedLon}`);
console.log(`Capital: ${details.capital}`);
console.log(`Continent: ${details.continent}`);
console.log(`Language: ${details.language}`);
console.log(`Population: ${details.population}`);
console.log(`Borders: ${details.borders}`); 
  // Display in searchdetails box
  /*document.getElementById('searchdetails').style.display = 'block';
  document.getElementById('searchdetails').innerHTML = htmlContent;*/

}

async function fetchStateDetails(displayName, osm_type, osm_id) {
  const stateQuery = `
      [out:json];
      ${osm_type}(${osm_id});
      out tags center;
  `;

  const result = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: `data=${encodeURIComponent(stateQuery)}`
  }).then(response => response.json());

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
      const wikidataDetailsResult = await fetch(wikidataDetailsUrl).then(response => response.json());

      if (wikidataDetailsResult.entities && wikidataDetailsResult.entities[wikidataEntityId]) {
          const entity = wikidataDetailsResult.entities[wikidataEntityId];
          const claims = entity.claims;
          const descriptions = entity.descriptions;

          const details = {
              country: '',
              capital: '',
              coordinates: `${center.lat}, ${center.lon}`,
              borders: [],
              summary: descriptions && descriptions.en ? descriptions.en.value : 'No summary available.'
          };

          // Fetch country
          if (claims.P17) {
              const countryId = claims.P17[0].mainsnak.datavalue.value.id;
              const countryDetails = await fetch(`https://www.wikidata.org/wiki/Special:EntityData/${countryId}.json`).then(res => res.json());
              details.country = countryDetails.entities[countryId].labels.en.value;
          }

          // Fetch capital
          if (claims.P36) { // Property for capital city
              const capitalId = claims.P36[0].mainsnak.datavalue.value.id;
              const capitalDetails = await fetch(`https://www.wikidata.org/wiki/Special:EntityData/${capitalId}.json`).then(res => res.json());
              details.capital = capitalDetails.entities[capitalId].labels.en.value;
          } else if (claims.P1376) { // Property for administrative territorial entity
              const capitalId = claims.P1376[0].mainsnak.datavalue.value.id;
              const capitalDetails = await fetch(`https://www.wikidata.org/wiki/Special:EntityData/${capitalId}.json`).then(res => res.json());
              details.capital = capitalDetails.entities[capitalId].labels.en.value;
          }

          // Fetch borders
          if (claims.P47) {
              details.borders = await Promise.all(claims.P47.map(async border => {
                  const borderId = border.mainsnak.datavalue.value.id;
                  const borderDetails = await fetch(`https://www.wikidata.org/wiki/Special:EntityData/${borderId}.json`).then(res => res.json());
                  return borderDetails.entities[borderId].labels.en.value;
              }));
          }
          
          let htmlContent = `
          <h2>Name: ${displayName}</h2>
          <h3>Main Details</h3>
          <p>Country: ${details.country}</p>
          <p>Capital: ${details.capital}</p>
          <p>Coordinates: ${roundedLat}, ${roundedLon}</p>
          <h3>Additional Details</h3>
          <p>Borders: ${details.borders.join(', ')}</p>
          <p>Summery: ${details.summary}</p>
          `;
          console.log(`Name: ${displayName}`);
          console.log(`Coordinates: ${roundedLat}, ${roundedLon}`);
          console.log(`Country: ${details.country}`);
          console.log(`Capital: ${details.capital}`);
          console.log(`Borders: ${details.borders.join(', ')}`);
          console.log(`Summary: ${details.summary}`);
          // Display in searchdetails box
         /* document.getElementById('searchdetails').style.display = 'block';
          document.getElementById('searchdetails').innerHTML = htmlContent;*/
      } else {
          console.log('No valid Wikidata entity found for the provided ID.');
      }
  } else {
      console.log('No Wikidata ID found for this state.');
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
      body: `data=${encodeURIComponent(districtQuery)}`
  }).then(response => response.json());

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
      const wikidataDetailsResult = await fetch(wikidataDetailsUrl).then(response => response.json());

      if (wikidataDetailsResult.entities && wikidataDetailsResult.entities[wikidataEntityId]) {
          const entity = wikidataDetailsResult.entities[wikidataEntityId];
          const claims = entity.claims;
          const descriptions = entity.descriptions;

          const details = {
              state: '',
              coordinates: `${center.lat}, ${center.lon}`,
              borders: [],
              summary: descriptions && descriptions.en ? descriptions.en.value : 'No summary available.'
          };

           // Fetch state (if applicable for the district)
           if (claims.P131) { // Property for located in the administrative territorial entity
              const stateId = claims.P131[0].mainsnak.datavalue.value.id;
              const stateDetails = await fetch(`https://www.wikidata.org/wiki/Special:EntityData/${stateId}.json`).then(res => res.json());
              details.state = stateDetails.entities[stateId].labels.en.value;
          }


          // Fetch borders (if available)
          if (claims.P47) {
              details.borders = await Promise.all(claims.P47.map(async border => {
                  const borderId = border.mainsnak.datavalue.value.id;
                  const borderDetails = await fetch(`https://www.wikidata.org/wiki/Special:EntityData/${borderId}.json`).then(res => res.json());
                  return borderDetails.entities[borderId].labels.en.value;
              }));
          }

          let htmlContent = `
          <h2>Name: ${displayName}</h2>
          <h3>Main Details</h3>
          <p>State: ${details.state}</p>
          <p>Coordinates: ${roundedLat}, ${roundedLon}</p>
          <h3>Additional Details</h3>
          <p>Borders: ${details.borders.join(', ')}</p>
          <p>Summery: ${details.summary}</p>
          `;
          // Display in searchdetails box
          /*document.getElementById('searchdetails').style.display = 'block';
          document.getElementById('searchdetails').innerHTML = htmlContent;*/
          console.log(`Name: ${displayName}`);
          console.log(`Coordinates: ${roundedLat}, ${roundedLon}`);
          console.log(`State: ${details.state}`);
          console.log(`Borders: ${details.borders.join(', ')}`);
          console.log(`Summary: ${details.summary}`);
          
      } else {
          console.log('No valid Wikidata entity found for the provided ID.');
      }
  } else {
      console.log('No Wikidata ID found for this district.');
  }
}

async function fetchOtherDetails(tags,result){
  fetchPrefix(tags).then(prefix=>{
      let htmlContent = `
      <h3>Main Details</h3>
      <p>Name : ${result.name}</p>
      <p>Address : ${result.display_name}</p>
      `;
      // Display in searchdetails box
      /*document.getElementById('searchdetails').style.display = 'block';
      document.getElementById('searchdetails').innerHTML = htmlContent;*/
      console.log('Type : '+prefix)
      console.log('Name : '+result.name)
      console.log('Address : '+result.display_name)
      })
}

async function fetchPrefix(result){
  var tags = result;
  var prefix = "";

  const response = await fetch("../src/components/search/prefix.json");
  const data = await response.json();

  if (tags.boundary === "administrative" && tags.admin_level) {
    prefix = data.prefix.admin_levels["level"+tags.admin_level]
  } else {
    var prefixes = data.prefix
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
      value = tags[key];

      if (prefixes[key]) {
        var first = value.slice(0, 1).toUpperCase(),
            rest = value.slice(1).replace(/_/g, " ");

        return first + rest;
      }
    }
  }
  return prefix
}

async function fetchRiverDetails(osm_type, osm_id) {
  const riverQuery = `
      [out:json];
      ${osm_type}(${osm_id});
      out tags center;
  `;

  const result = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: `data=${encodeURIComponent(riverQuery)}`
  }).then(response => response.json());

  const river = result.elements[0];
  const tags = river.tags;
  const center = river.center;
  const riverName = tags.name || "Unnamed River";
  const wikidataTag = tags.wikidata;
  if (wikidataTag) {
      const wikidataEntityId = wikidataTag
      try {
          
          const wikidataDetailsUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&origin=*&format=json&ids=${wikidataEntityId}&props=claims|descriptions`;
          const wikidataDetailsResult = await fetch(wikidataDetailsUrl).then(response => response.json());
          if (wikidataDetailsResult.entities && wikidataDetailsResult.entities[wikidataEntityId]) {
              const entity = wikidataDetailsResult.entities[wikidataEntityId];
              const claims = entity.claims;
              const descriptions = entity.descriptions;
              const details = {
                  name: riverName,
                  origin: '',
                  mouth: '',
                  tributaries: [],
                  length: '',
                  summary: descriptions && descriptions.en ? descriptions.en.value : 'No summary available.',
              };
               // Fetch origin (source of the river)
               if (claims.P885) { // Property for source of watercourse
                  const originId = claims.P885[0].mainsnak.datavalue.value.id;
                  const originDetails = await fetch(`https://www.wikidata.org/wiki/Special:EntityData/${originId}.json`).then(res => res.json());
                  details.origin = originDetails.entities[originId].labels.en.value;
              }
              // Fetch mouth
              if (claims.P403) { // Property for mouth of the watercourse
                  const mouthId = claims.P403[0].mainsnak.datavalue.value.id;
                  const mouthDetails = await fetch(`https://www.wikidata.org/wiki/Special:EntityData/${mouthId}.json`).then(res => res.json());
                  details.mouth = mouthDetails.entities[mouthId].labels.en.value;
              }
              // Fetch tributaries
              if (claims.P974) { // Property for tributaries
                  details.tributaries = await Promise.all(claims.P974.map(async tributary => {
                      const tributaryId = tributary.mainsnak.datavalue.value.id;
                      const tributaryDetails = await fetch(`https://www.wikidata.org/wiki/Special:EntityData/${tributaryId}.json`).then(res => res.json());
                      return tributaryDetails.entities[tributaryId].labels.en.value;
                  }));
              }
              // Fetch length
              if (claims.P2043) { // Property for length
                  const lengthValue = claims.P2043[0].mainsnak.datavalue.value.amount;
                  details.length = `${lengthValue} meter`;
              }
              let htmlContent = `
              <h3>Rever Details</h3>
              <p>Name: ${details.name}</p>
              <p>Length: ${details.length}</p>
              <p>Origin: ${details.origin}</p>
              <p>Mouth: ${details.mouth}</p>
              <p>Tributaries: ${details.tributaries.join(', ')}</p>
              `;
              // Display in searchdetails box
              /*document.getElementById('searchdetails').style.display = 'block';
              document.getElementById('searchdetails').innerHTML = htmlContent;*/
              console.log(`Name: ${details.name}`);
              console.log(`Length: ${details.length}`);
              console.log(`Origin: ${details.origin}`);
              console.log(`Mouth: ${details.mouth}`);
              console.log(`Tributaries: ${details.tributaries.join(', ')}`);
              console.log(`Summary: ${details.summary}`);
              
          } else {
              console.log('No valid Wikidata entity found for the provided ID.');
          }
      } catch (error) {
          console.error('Error fetching Wikidata details:', error);
      }
  } else {
      console.log('No Wikidata ID found for this river.');
  }
}
//clearing searchdetails box when not in use
function clearSearchDetails() {
  document.getElementById('searchdetails').style.display = 'none';
  document.getElementById('searchdetails').innerHTML = '';
}
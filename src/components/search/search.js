var searchInput = document.getElementById('search-input');
var searchResults = document.getElementById('search-results');
var mapContainer = document.getElementById('map');
// Function to handle search and update results
function performSearch(query) {
    // Clear previous results
    searchResults.innerHTML = '';
    // Perform Nominatim search
    fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json`)
        .then(response => response.json())
        .then(data => {
            // Display search results
            data.forEach(result => {
                var li = document.createElement('li');
                li.textContent = result.display_name;
                li.addEventListener('click', function () {
                    // Update map view on selecting a result
                    //map.setView([result.lat, result.lon], 13);
                    geoJSON(result.osm_type,result.osm_id)
                    searchResults.innerHTML = '';
                    console.log(result)
                });
                searchResults.appendChild(li);
            });
        })
        .catch(error => console.error('Error fetching search results:', error));
}
// Event listener for search input
searchInput.addEventListener('input', function () {
    var query = searchInput.value.trim();
    if (query.length > 2) {
        performSearch(query);
    } else {
        searchResults.innerHTML = '';
    }
});
// Event listener for map click
mapContainer.addEventListener('click', function () {
    // Clear search results when the map is clicked
    searchResults.innerHTML = '';
});

var geoLayer=null 
async function geoJSON(type,id){

    var result = await fetch(
        "https://overpass-api.de/api/interpreter",
        {
            method: "POST",
            // The body contains the query
            // to understand the query language see "The Programmatic Query Language" on
            // https://wiki.openstreetmap.org/wiki/Overpass_API#The_Programmatic_Query_Language_(OverpassQL)
            body: "data="+ encodeURIComponent(`
            [out:json][timeout:25];(${type}(${id}););out geom;`)
        },
    ).then(
        (data)=>data.json()
    )
    if(geoLayer!=null){
        geoLayer.remove();
        delete centre
    }//removing if there any already    
    if(result.elements[0].members){
        if(result.elements[0].members[result.elements[0].members.length-1].role=="label"){
            centre={
                lat: result.elements[0].members[result.elements[0].members.length-1].lat,
                lng: result.elements[0].members[result.elements[0].members.length-1].lon
            }
        }
    }
    
    result = osmtogeojson(result) //converting JSON to geoJSON
    
    

    //adding geoJSON to map
    geoLayer = L.geoJSON(result, {
        style: function(feature) {
            return {
                color: 'red', // Border color
                fillColor: 'yellow',
                fillOpacity: 0.5 // Adjust fill opacity as needed
            };
        },
        onEachFeature: function (feature, layer) {
            if (feature.properties && feature.properties.popupContent) {
                layer.bindPopup(feature.properties.popupContent);
            }
        }
    }).addTo(map);

    map.fitBounds(bound=geoLayer.getBounds())//aligning the added layer to centre of the map 
    
    if(typeof centre!='undefined'){
        addmarker(centre)
    }else{
        addmarker(map.getCenter());
    }
}

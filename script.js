
var map = L.map('map').setView([10.903219337541, 76.43448118177776], 13);
//Adding map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Leaflet | © OpenStreetMap contributors'
}).addTo(map);
// marker appears when clicking
var marker;
map.on('click', function (event) {
    if (marker) {
        map.removeLayer(marker);
    }
    marker = L.marker(event.latlng).addTo(map);
});
//display data from overpass API
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
    
    result = osmtogeojson(result) //converting JSON to geoJSON
    
    if(geoLayer!=null){
        geoLayer.remove();
    }//removing if there any already    

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

    map.fitBounds(geoLayer.getBounds())//aligning the added layer to centre of the map 

}
console.log("call function geoJSON(type,osm_id)")
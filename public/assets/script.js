
/*L.FixedPixelCircle = L.Circle.extend({

    // Overriding the _project method to maintain a fixed pixel radius
    _project() {
        const map = this._map;
        this._point = map.latLngToLayerPoint(this._latlng); // Convert the latLng to a point in the map pane's coordinate system

        // Here, we're directly using _mRadius as a pixel value, rather than converting from meters to pixels
        this._radius = this._mRadius;
        this._radiusY = this._mRadius;

        this._updateBounds();
    },

    // You may also need to override any other methods that specifically deal with radius in meters to ensure consistency
});

// Factory for consistency with Leaflet's way of creating layers
L.fixedPixelCircle = function(latlng, options) {
    return new L.FixedPixelCircle(latlng, options);
};*/

var map = L.map('map').setView([10.903219337541, 76.43448118177776], 13);
//Adding map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Leaflet | © OpenStreetMap contributors'
}).addTo(map);
var mar
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

L.AdPointer = L.Layer.extend({
    
    initialize: function(pointer) {
        // Constructor function
        this.pointer=pointer;
        distance= this._fixdist(map.getZoom())/5
        this.distance = distance; // Distance in meters
        var angle= 90  // Angle in degrees from north
        this.angle=angle

    },

    onAdd: function(map) {
        this._map = map;
        this._map.on('click', this._onClick, this);
        var sel=0; //selector, angle or distance
        document.addEventListener('keydown', function(event) {

            switch(event.key) {
                case 'a': // Listen to 'w'
                    sel++
                    break;
                case 'w':
                    if (sel%2==0){
                        AdPointer.distance=AdPointer.distance+(AdPointer._fixdist(map.getZoom())/5);
                        AdPointer._secondoryupdate(AdPointer.primaryMarker.getLatLng())
                    }else{
                        AdPointer.angle=AdPointer.angle+1;
                        AdPointer._secondoryupdate(AdPointer.primaryMarker.getLatLng())
                    }
                    break;
                case 's':
                    if (sel%2==0){
                        AdPointer.distance=AdPointer.distance-(AdPointer._fixdist(map.getZoom())/5);
                        AdPointer._secondoryupdate(AdPointer.primaryMarker.getLatLng())
                    }else{
                        AdPointer.angle=AdPointer.angle-1;
                        AdPointer._secondoryupdate(AdPointer.primaryMarker.getLatLng())    
                    }
                    break;
            }
        })
        var svgstr = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
        <circle cx="7.5" cy="7.5" r="6.5" fill="#C60000" stroke="black" stroke-width="2"/>
        </svg>` 
       
       
        var customIcon = L.divIcon({
            className: 'custom-div-icon',
            html: svgstr, // Use the SVG string as the HTML content
            iconSize: [15,15], // Adjust the icon size as needed
            iconAnchor: [6.5,6.5] // Adjust the anchor point as needed
        });
       
            
    
        
            this.primaryMarker = new L.Marker(this.pointer,{ 
                icon: customIcon
            }).addTo(this._map);
        
        
        this.distance=this._fixdist(map.getZoom())
        this.angle=90
        const marker1 = this.primaryMarker
        const marker2 = this._secondoryupdate(this.pointer)
        var markerelement = marker2.getElement()
        var svg = markerelement.querySelector('svg')
        this.line = L.polyline([marker1.getLatLng(), marker2.getLatLng()], {color: 'black', weight: 5}).addTo(map);
        this.secondaryMarker.on('move',function(e){
            AdPointer.angle=AdPointer._getAngle(marker1,marker2)
            svg.setAttribute('transform','rotate('+(AdPointer.angle-90)+')')
            AdPointer.distance=map.distance(marker1.getLatLng(), marker2.getLatLng())
            AdPointer.line.setLatLngs([marker1.getLatLng(), marker2.getLatLng()]);
            AdPointer._updateInfoBox();

        })
        this._updateInfoBox();
    },

    onRemove: function(map) {
        // Method called when the layer is removed from the map
        // Clean up by removing the markers and event listeners
        if (this.primaryMarker) {
            mar = this.primaryMarker.getLatLng()
            this.primaryMarker.remove();
        }
        if (this.secondaryMarker) {
            this.secondaryMarker.remove();
        }
        if (this.line) {
            this.line.remove();
        }
        document.getElementById('infoBox').style.display = 'none';
        this._map.off('click', this._onClick, this);
    },
    


    _calculateDestination: function(start, distance, angle) {
        
        const earthRadius = 6371e3;
        const δ = distance / earthRadius; // Angular distance in radians
        const θ = angle * (Math.PI / 180); // Convert angle to radians
      
        const φ1 = start.lat * (Math.PI / 180);
        const λ1 = start.lng * (Math.PI / 180);
      
        const φ2 = Math.abs(φ1) === Math.PI / 2
            ? Math.sign(φ1) * (Math.PI / 2 - δ)
            : Math.asin(Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ));
      
        const λ2 = λ1 + Math.atan2(Math.sin(θ) * Math.sin(δ) * Math.cos(φ1), Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2));
      
        return L.latLng(φ2 * (180 / Math.PI), λ2 * (180 / Math.PI));
      },
    /*_calculatePixelDistance: function(startLatLng, distance, angle) {
        // Calculate the destination point
        const destinationLatLng = this._calculateDestination(startLatLng, distance, angle);
    
        // Convert the start and destination points from LatLng to pixel coordinates
        const startPixel = map.project(startLatLng, map.getZoom());
        const destinationPixel = map.project(destinationLatLng, map.getZoom());
    
        // Calculate the distance in pixels
        const pixelDistance = startPixel.distanceTo(destinationPixel);
    
        return pixelDistance;
    },*/
    _getAngle: function(marker1,marker2) {

        const lat1 = marker1.getLatLng().lat;
        const lon1 = marker1.getLatLng().lng;
        const lat2 = marker2.getLatLng().lat;
        const lon2 = marker2.getLatLng().lng;   

        // Convert latitudes and longitudes from degrees to radians
        const lat1Rad = lat1 * (Math.PI / 180);
        const lat2Rad = lat2 * (Math.PI / 180);
        const deltaLonRad = (lon2 - lon1) * (Math.PI / 180);
    
        // Calculate the bearing
        const y = Math.sin(deltaLonRad) * Math.cos(lat2Rad);
        const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
                  Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(deltaLonRad);
        let bearing = Math.atan2(y, x) * (180 / Math.PI);
    
        // Normalize the bearing to 0-360 degrees
        bearing = (bearing + 360) % 360;
    
        return bearing;
    },
    _fixdist: function(num) {
        const distanceArray = [1280000,6400000,3200000,1600000,800000,400000,200000,96000,48000,24000,12000,6000,3000,1500,700,350,150,100,50];
        return distanceArray[num];
    },
    _secondoryupdate: function(primary){
        var arrowhead = `<svg id="mysvg" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)" width="18" height="15" viewBox="0 0 18 15" fill="none">
        <path id="polygon" d="M0.5 0.75L16.7 7.5L0.5 14.25V0.75Z" fill="#005304" stroke="black"/>
        </svg>`   

        var arrowIcon = L.divIcon({
            className: 'arrow-div-icon',
            html: arrowhead, // Use the SVG string as the HTML content
            iconSize: [18,15], // Adjust the icon size as needed
            iconAnchor: [9,7.5] // Adjust the anchor point as needed
        });
        const idestination = this._calculateDestination(primary, this.distance, this.angle);

        // Add or move the secondary marker
        if (this.secondaryMarker) {
            this.secondaryMarker.setLatLng(idestination);
        } else {
            this.secondaryMarker = new L.marker(idestination,{ icon : arrowIcon, draggable: true}).addTo(this._map);
        }
        this._updateInfoBox();
        return this.secondaryMarker
       
    },

    _updateInfoBox: function() {
        // Only show the box when the secondary marker exists
        if (this.secondaryMarker) { 
          document.getElementById('infoBox').style.display = 'block';
          const distanceInKm = this.distance / 1000; 
          // Update the display:
          document.getElementById('distanceDisplay').textContent = distanceInKm.toFixed(2) + ' KM';
          document.getElementById('angleDisplay').textContent = Math.round(this.angle) + ' degrees';
          document.getElementById('lat').textContent =' Latitude : '+ this.secondaryMarker.getLatLng().lat
          document.getElementById('lng').textContent =' Longitude : '+ this.secondaryMarker.getLatLng().lng
          
        } else {
          document.getElementById('infoBox').style.display = 'none';
        }
      }


});

// Usage
var AdPointer /*= new L.AdPointer([10.903219337541, 76.43448118177776]); // distance in meters, angle in degrees
AdPointer.addTo(map);*/





//     MARKER      

var marker;
function addmarker(coord){
    if(AdPointer){
        AdPointer.remove()
      AdPointer=null

    }
    if(!marker){
    marker = L.circleMarker(coord,{
        radius: 4,
        color: "black",
        fillOpacity: 1
        
    }).addTo(map)
    }
}
function addAdPointer(coord) {
    if (marker) {
      marker.remove();
      marker=null
    }
    if (!AdPointer) {
      AdPointer = new L.AdPointer(coord); // distance in meters, angle in degrees
      AdPointer.addTo(map);
    }
  }
addmarker([10.903219337541, 76.43448118177776])

   // Function to handle map movement based on arrow keys
   function moveMap(direction) {
    var center = marker.getLatLng();
    var lat = center.lat;
    var lng = center.lng;

    switch(direction) {
        case 'up':
            lat += 0.000005*(fixdist(map.getZoom()));  // Change this value to adjust movement sensitivity
            break;
        case 'down':
            lat -= 0.000005*(fixdist(map.getZoom()));;  // Change this value to adjust movement sensitivity
            break;
        case 'left':
            lng -= 0.000005*(fixdist(map.getZoom()));;  // Change this value to adjust movement sensitivity
            break;
        case 'right':
            lng += 0.000005*(fixdist(map.getZoom()));;  // Change this value to adjust movement sensitivity
            break;
    }

    // Set the new center of the map
    marker.setLatLng(new L.LatLng(lat, lng));
    map.panTo(marker.getLatLng());
}

// Listen for keydown event on the whole document
document.addEventListener('keydown', function(event) {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.tagName === 'SELECT') {
        return; // Do nothing if the event target is any of the above
    }
    /*if(AdPointer){
        AdPointer.remove()
    }*/
    if(event.key == 'a' || event.key == 'w' || event.key == 's'){
        if(marker){
            addAdPointer(marker.getLatLng())
        }
    }
   /* if(event.key=='ArrowUp'||'ArrowDown'||'ArrowLeft'||'ArrowRight'){
        if(!marker){
            addmarker(mar)
        }
    }*/
    switch(event.key) {
        
        case 'ArrowUp':
            addmarker(mar)
            moveMap('up');
            break;
        case 'ArrowDown':
            addmarker(mar)
            moveMap('down');
            break;
        case 'ArrowLeft':
            addmarker(mar)
            moveMap('left');
            break;
        case 'ArrowRight':
            addmarker(mar)
            
            moveMap('right');
            break;
        default: break;
    }
    

});
function fixdist(num) {
    const distanceArray = [1280000,6400000,3200000,1600000,800000,400000,200000,96000,48000,24000,12000,6000,3000,1500,700,350,150,100,50];
    return distanceArray[num];
}
map.on('click',function(e){
    addmarker(e.latlng)
    marker.setLatLng(e.latlng)
    
})

/*












})*/
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
                    addmarker([result.lat,result.lon])
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
// Event listener for zoom in
document.getElementById('controls-box').querySelector('.fa-plus').addEventListener('click', function () {
    map.zoomIn();
});
// Event listener for zoom out
document.getElementById('controls-box').querySelector('.fa-minus').addEventListener('click', function () {
    map.zoomOut();
});
//Event listener for navigation 
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
    } else {
        console.error("Geolocation is not supported by this browser.");
    }

    function successCallback(position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        map.panTo([lat,lon])
        map.setZoom(10)
        //console.log(`Current location: ${lat}, ${lon}`);
    }

    function errorCallback(error) {
        console.error(`Error getting location: ${error.message}`);
    }
}
document.getElementById('controls-box').querySelector('.fa-location-arrow').addEventListener('click', function () {

    getLocation();
});
// Event listener for layers button
var layersDropdown = document.getElementById('layers-dropdown');
var layersBtn = document.getElementById('layers-btn');
var geographicalLayerBtn = document.getElementById('geographical-layer');
var politicalLayerBtn = document.getElementById('political-layer');
// Toggle visibility of layers dropdown
layersBtn.addEventListener('click', function () {
    layersDropdown.style.display = (layersDropdown.style.display === 'block') ? 'none' : 'block';
});
// Event listener for geographical layer
geographicalLayerBtn.addEventListener('click', function () {
    // Add your logic to switch to the geographical layer
    console.log('Switching to Geographical Layer');
    layersDropdown.style.display = 'none'; // Hide dropdown
});
// Event listener for political layer
politicalLayerBtn.addEventListener('click', function () {
    // Add your logic to switch to the political layer
    console.log('Switching to Political Layer');
    layersDropdown.style.display = 'none'; // Hide dropdown
});
var marker;
function addmarker(coord){
    if(AdPointer){
        AdPointer.remove()
      AdPointer=null

    }
    if(marker){
        marker.setLatLng(coord)
    }
    else if(!marker){
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

   // Function to handle map movement based on arrow keys
   function moveMap(direction) {
    if(!marker){
        addmarker(AdPointer.primaryMarker.getLatLng())
    }
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
    //fmarker.setLatLng(new L.LatLng(lat, lng));
    const mar= {lat: lat, lng: lng}
    return mar;
}

// Listen for keydown event on the whole document
document.addEventListener('keydown', function(event) {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.tagName === 'SELECT') {
        return; // Do nothing if the event target is any of the above
    }
   
    if(event.key == 'a' || event.key == 'w' || event.key == 's'){
        if(marker){
            addAdPointer(marker.getLatLng())
        }
    }

    switch(event.key) {
        
        case 'ArrowUp':
            addmarker(moveMap('up'))
            break;
        case 'ArrowDown':
            addmarker(moveMap('down'))
            break;
        case 'ArrowLeft':
            addmarker( moveMap('left'))
            break;
        case 'ArrowRight':
            addmarker( moveMap('right'))
            break;
        default: break;
    }
    if(marker)map.panTo(marker.getLatLng());
    

});
function fixdist(num) {
    const distanceArray = [1280000,6400000,3200000,1600000,800000,400000,200000,96000,48000,24000,12000,6000,3000,1500,700,350,150,100,50];
    return distanceArray[num];
}
map.on('click',function(e){
    addmarker(e.latlng)
    marker.setLatLng(e.latlng)
    
})







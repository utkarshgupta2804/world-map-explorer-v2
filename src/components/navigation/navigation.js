var marker;
var pane=map.createPane('customPane')
map.getPane('customPane').style.zIndex = 1000; //for control z index of marker
function addmarker(coord){
    if(AdPointer){
        AdPointer.remove()
      AdPointer=null

    }
    if(marker){
        let old = marker.getLatLng()
        marker.setLatLng(coord).addTo(map)
        borderCheck(map.project(old).distanceTo(map.project(marker.getLatLng())))
    }
    else if(!marker){
    marker = L.circleMarker(coord,{
        radius: 4,
        color: "black",
        fillOpacity: 1,
        pane: 'customPane'
        
    }).addTo(map)
    marker.getElement().setAttribute('tabindex','0')
    marker.getElement().setAttribute('title','marker')
    addpoly()
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
     if(poly){
        poly.remove()
     }

    }
  }

   // Function to handle map movement based on arrow keys
   function moveMap(direction) {
    if(!marker){
        addmarker(AdPointer.primaryMarker.getLatLng())
    }
    var center = marker.getLatLng();
    var point = map.latLngToLayerPoint(center)
    var lat = point.x;
    var lng = point.y;
    let movement = 10//0.000005*(fixdist(map.getZoom()))
    switch(direction) {
        case 'up':
            lng -= movement;  // Change this value to adjust movement sensitivity
            break;
        case 'down':
            lng += movement;;  // Change this value to adjust movement sensitivity
            break;
        case 'left':
            lat -= movement;;  // Change this value to adjust movement sensitivity
            break;
        case 'right':
            lat += movement;;  // Change this value to adjust movement sensitivity
            break;
    }

    // Set the new center of the map
    //fmarker.setLatLng(new L.LatLng(lat, lng));
    const mar= map.layerPointToLatLng(L.point(lat,lng));
    return mar;
}

// Listen for keydown event on the whole document
document.addEventListener('keydown', function(event) {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.tagName === 'SELECT') {
        return; // Do nothing if the event target is any of the above
    }
   
    if(event.key == 'a' || event.key == 'w' || event.key == 's'){
        event.preventDefault();
        if(marker){ 
            addAdPointer(marker.getLatLng())
        }
    }
    if(event.code == 'KeyF'||event.code == 'Enter'){
        event.preventDefault();
        let pointer
        if(marker){
            pointer=marker
        }
        if(AdPointer){
            pointer=AdPointer.primaryMarker
        }
        findplacename(pointer,event).then(nm=>{
            console.log(nm)
            var message = new SpeechSynthesisUtterance();
            message.text = nm;
            speechSynthesis.speak(message);
        })
    }
    if(event.code=='KeyZ'){
        event.preventDefault();
       try {
        let scale = 40075016 * Math.cos(marker.getLatLng().lat * Math.PI / 180) / Math.pow(2, map.getZoom() + 8)*10
        let zoom = scale<1000?parseInt(scale)+' meters':parseInt(scale/1000)+' Kilo meters'
        console.log(zoom)
        var  zoomLevel = new SpeechSynthesisUtterance()
        zoomLevel.text = zoom;
        speechSynthesis.speak(zoomLevel)
       } catch (error) {
        alert('add marker first')
       }
    }
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowRight' ) {
        event.preventDefault(); // Prevent the default behavior
         event.stopImmediatePropagation(); // Stop the event from propagating further
        switch (event.key) {
            case 'ArrowUp':
                addmarker(moveMap('up'));
                break;
            case 'ArrowDown':
                addmarker(moveMap('down'));
                break;
            case 'ArrowLeft':
                addmarker(moveMap('left'));
                break;
            case 'ArrowRight':
                addmarker(moveMap('right'));
                break;
            default:
                break;
        }
    }
    
    if(marker)map.panTo(marker.getLatLng());
    //if (event.keyCode === 13) {
    //    map.click();
    //}

});
function fixdist(num) {
    const distanceArray = [1280000,6400000,3200000,1600000,800000,400000,200000,96000,48000,24000,12000,6000,3000,1500,700,350,150,100,50];
    return distanceArray[num];
}
map.on('click',function(e){
    addmarker(e.latlng)
    marker.setLatLng(e.latlng)
    console.log('aaaa')
    
})
async function findplacename(point,event){
    if(point){
        let name
        if(event?event.shiftKey:event){
          return marker.getLatLng().lat.toFixed(5)+' North, '+marker.getLatLng().lng.toFixed(5)+' West'
        }else{
         await fetch(`https://nominatim.openstreetmap.org/reverse.php?lat=${point.getLatLng().lat}&lon=${point.getLatLng().lng}&zoom=${map.getZoom()}&format=jsonv2`)
      .then(response => response.json())
      .then(data => {
        if(event.code=="Enter"){
            //console.log(data)
            placeappear(data)
        }
        name = data.name
        if(data.error=="Unable to geocode"){
            name ='Sea'
        }
        })
        }
        return name
      }else{
          alert("click somewhere first!")
      }
}







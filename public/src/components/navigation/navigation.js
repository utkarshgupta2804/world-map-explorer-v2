var marker, place, borderpoints, northDistance, southDistance, westDistance, eastDistance, perkeydist;
let flag3=true
let quu
let timeout
let old

const clickSound = new Audio('click.wav');
const closeSound = new Audio('close.flac');
var pane = map.createPane('customPane')
map.getPane('customPane').style.zIndex = 1000; //for control z index of marker
function isGeoPresent(){
     return geoLayer ? (map.hasLayer(geoLayer)&&(leafletPip.pointInLayer(marker.getLatLng(), geoLayer).length > 0)) : false;
}
//function for adding marker
function addmarker(coord) {
    if(coord[0]<-180){
        coord[0]=180
        updateLiveRegion(`Marker moved to other side of the map`,true)
    }
    if(coord[0]>180){
        coord[0]=-180
        updateLiveRegion(`Marker moved to other side of the map`,true)
    }
    if(coord?.lng<-180){
        coord.lng=180
        updateLiveRegion(`Marker moved to other side of the map`,true)
    }
    if(coord?.lng>180){
        coord.lng=-180
        updateLiveRegion(`Marker moved to other side of the map`,true)
    }
    if (AdPointer) {
        AdPointer.remove()
        AdPointer = null
        updateLiveRegion(`Adjustable pointer off`)
        closeSound.play()

    }
    if (marker) {
        old = marker.getLatLng()//previos marker location
        marker.setLatLng(coord).addTo(map)
        borderCheck(map.project(old).distanceTo(map.project(marker.getLatLng())))// for checking border cross
    }
    else if (!marker) {
        marker = L.circleMarker(coord, {
            radius: 4,
            color: "black",
            fillOpacity: 1,
            pane: 'customPane'

        }).addTo(map)
        findplacename(marker).then((place)=>{
            updateLiveRegion(`Marker is on ${place}. Use arrow keys to navigate`,true)
        })
        //marker.getElement().setAttribute('tabindex', '0')
        //marker.getElement().setAttribute('title', 'marker')
        addpoly().then(() => {
            if (!isGeoPresent()) {
                place = poly.toGeoJSON()

            }
        })

    }
    if (isGeoPresent()) {

        place = geoLayer.toGeoJSON()
    } else if (poly ? map.hasLayer(poly) : false) {
        place = poly.toGeoJSON()
    }
    if (place) {
        borderpoints = findborderpoints()
        northDistance = L.latLng(borderpoints.north).distanceTo(marker.getLatLng())
        southDistance = L.latLng(borderpoints.south).distanceTo(marker.getLatLng())
        eastDistance = L.latLng(borderpoints.east).distanceTo(marker.getLatLng())
        westDistance = L.latLng(borderpoints.west).distanceTo(marker.getLatLng())
    }
    fetchElevation()

}
function findborderpoints() {
    try {
        var longitude = marker.getLatLng().lng
        var lineSN = turf.lineString([
            [longitude, 90],  // Start point at the North Pole
            [longitude, -90]  // End point at the South Pole
        ]);
        var intersections = turf.lineIntersect(lineSN, place);
        var val = intersections.features.map(feature => feature.geometry.coordinates[1]);
        var greaterNumbers = val.filter(num => num > marker.getLatLng().lat)
        var LesserNumbers = val.filter(num => num < marker.getLatLng().lat)
        const north = Math.min(...greaterNumbers);
        const south = Math.max(...LesserNumbers);


        const latitude = marker.getLatLng().lat
        const lineWE = turf.lineString([
            [-180, latitude],  // Start point at the North Pole
            [180, latitude]  // End point at the South Pole
        ]);
        intersections = turf.lineIntersect(lineWE, place);
        val = intersections.features.map(feature => feature.geometry.coordinates[0]);
        greaterNumbers = val.filter(num => num > marker.getLatLng().lng)
        LesserNumbers = val.filter(num => num < marker.getLatLng().lng)
        const west = Math.min(...greaterNumbers);
        const east = Math.max(...LesserNumbers);
        return {
            north: [north, longitude],
            south: [south, longitude],
            west: [latitude, west],
            east: [latitude, east]
        }
    } catch (error) {
        console.error('ddd' + error)
    }

}


//function for adding adpointer 
function addAdPointer(coord) {
    if (marker) {
        marker.remove();
        poly && poly.remove()
        poly=null
       // marker = null
    }
    if (!AdPointer) {
        AdPointer = new L.AdPointer(coord); // distance in meters, angle in degrees
        AdPointer.addTo(map);
        updateLiveRegion(`Adjustable pointer on. use key 'A' to change between angle and distance. use keys 'W' and 'S' to increase and decrease values`,true)

        if (poly) {
            poly.remove()
        }

    }
}

// Function to handle map movement based on arrow keys
function moveMap(direction) {
    if (!marker) {
        addmarker(AdPointer.primaryMarker.getLatLng())
    }
    flag3=true
    clickSound.play()
    var center = marker.getLatLng();
    var point = map.latLngToLayerPoint(center)
    var lat = point.x;
    var lng = point.y;
    let movement = 10//0.000005*(fixdist(map.getZoom()))
    switch (direction) {
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
    const mar = map.layerPointToLatLng(L.point(lat, lng));
    return mar;
}

// Listen for keydown event on the whole document
const throttledFunction = _.throttle((event) => {
    flag3 = false
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.tagName === 'SELECT') {
        return; // Do nothing if the event target is any of the above
    }

    if (event.key.toLowerCase() == 'a' || event.key == 'w' || event.key == 's') {//enable adpointer
        event.preventDefault();
        if (event.altKey && event.key === 's') {
            // Prevent default behavior if needed (e.g., avoid browser shortcuts)
            event.preventDefault();
            
            // Focus on the search bar element
            document.getElementById('search-input')?.focus() // Adjust the ID to match your HTML element
        }else{
            if (marker) {
                addAdPointer(marker.getLatLng())
            }
        }
    }
    if (event.code == 'KeyF' || event.code == 'Enter') { //for stating place name and select place 
        event.preventDefault();
        let pointer
        if (marker) {
            pointer = marker
        }
        if (AdPointer) {
            pointer = AdPointer.primaryMarker
        }
        findplacename(pointer, event).then(nm => {
            console.log(nm)
            updateLiveRegion(nm,true)
        })
    }
    if (event.code == 'KeyZ') { // for stating zoom value
        event.preventDefault();
        try {
            let scale = 40075016 * Math.cos(marker.getLatLng().lat * Math.PI / 180) / Math.pow(2, map.getZoom() + 8) * 10
            let zoom = scale < 1000 ? parseInt(scale) + ' meters' : parseInt(scale / 1000) + ' Kilo meters'
            console.log(zoom)
            updateLiveRegion(zoom+' per key press',true)

        } catch (error) {
            alert('add marker first')
        }
    }
    if (event.code == 'KeyL') { // locate current user location
        document.getElementById("locateme").click()
    }
    if(event.code == 'KeyE'){//for stating altitude
        event.preventDefault();
        updateLiveRegion(document.getElementById("elevation").innerHTML)
    }
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') { //marker movement on map using arrowkeys
        if (!event.shiftKey) {
            perkeydist = 40075016 * Math.cos(marker.getLatLng().lat * Math.PI / 180) / Math.pow(2, map.getZoom() + 8) * 10
            event.preventDefault(); // Prevent the default behavior
            event.stopImmediatePropagation(); // Stop the event from propagating further
            switch (event.key) {
                case 'ArrowUp':
                    if (isGeoPresent()) {
                        if ((northDistance <= perkeydist)) {
                            addmarker([borderpoints.north[0] - 0.000001, borderpoints.north[1]])
                            bordertouched("north")
                        } else {
                            addmarker(moveMap('up'));

                        }
                    } else {
                        addmarker(moveMap('up'));
                    }
                    break;
                case 'ArrowDown':
                    if (isGeoPresent()) {
                        if ((southDistance <= perkeydist)) {
                            addmarker([borderpoints.south[0] + 0.000001, borderpoints.south[1]])
                            bordertouched("south")

                        } else {
                            addmarker(moveMap('down'));

                        }
                    } else {
                        addmarker(moveMap('down'));
                    }
                    break;
                case 'ArrowLeft':
                    if (isGeoPresent()) {
                        if ((eastDistance <= perkeydist)) {
                            addmarker([borderpoints.east[0], borderpoints.east[1] + .000001])
                            bordertouched("east")

                        } else {
                            addmarker(moveMap('left'));

                        }
                    } else {
                        addmarker(moveMap('left'));
                    }
                    break;
                case 'ArrowRight':
                    if (isGeoPresent()) {
                        if ((westDistance <= perkeydist)) {
                            addmarker([borderpoints.west[0], borderpoints.west[1] - .000001])
                            bordertouched("west")

                        } else {
                            addmarker(moveMap('right'));

                        }
                    } else {
                        addmarker(moveMap('right'));
                    }
                    break;
                default:
                    break;
            }
        }
    }
    if (
        (event.key === 'ArrowUp' && event.shiftKey) ||
        (event.key === 'ArrowDown' && event.shiftKey) ||
        (event.key === 'ArrowLeft' && event.shiftKey) ||
        (event.key === 'ArrowRight' && event.shiftKey)
    ) {
        if (event.shiftKey) {  // First, check if the Shift key is pressed
            let dis
            switch (event.key) {
                case 'ArrowUp':
                    dis = northDistance < 1000 ? parseInt(northDistance) + ' meters' : parseInt(northDistance / 1000) + ' Kilo meters'
                    console.log(dis)
                    updateLiveRegion(dis+' to north',true)

                    break;

                case 'ArrowDown':
                    dis = southDistance < 1000 ? parseInt(southDistance) + ' meters' : parseInt(southDistance / 1000) + ' Kilo meters'
                    console.log(dis)
                    updateLiveRegion(dis+' to south',true)

                    break;

                case 'ArrowLeft':
                    dis = eastDistance < 1000 ? parseInt(eastDistance) + ' meters' : parseInt(eastDistance / 1000) + ' Kilo meters'
                    console.log(dis)
                    updateLiveRegion(dis+' to west',true)
	
                    break;

                case 'ArrowRight':
                    dis = westDistance < 1000 ? parseInt(westDistance) + ' meters' : parseInt(westDistance / 1000) + ' Kilo meters'
                    console.log(dis)
                    updateLiveRegion(dis+' to east',true)
                    break;

            }
        }
    }
    if (marker) map.panTo(marker.getLatLng());
    timeout && clearTimeout(timeout)
    timeout=setTimeout(() => {
        
        updateLiveRegion(quu)
        quu=""
        flag3 && findplacename(marker).then((place)=>{
            updateLiveRegion(place,true)
        })
      }, 650);

},120);
mape.addEventListener("keydown",throttledFunction)
// function fixdist(num) {
//     const distanceArray = [1280000, 6400000, 3200000, 1600000, 800000, 400000, 200000, 96000, 48000, 24000, 12000, 6000, 3000, 1500, 700, 350, 150, 100, 50];
//     return distanceArray[num];
// }
map.on('click', function (e) {//appear marker when clicking
    addmarker(e.latlng)
    marker.setLatLng(e.latlng)
    // console.log('aaaa')

})
async function findplacename(point, event) {
    if (point) {
        let name
        if (event ? event.shiftKey : event) {
            return marker.getLatLng().lat.toFixed(5) + ' North, ' + marker.getLatLng().lng.toFixed(5) + ' West'
        } else {
            await fetch(`${geocodingAPI}/reverse.php?lat=${point.getLatLng().lat}&lon=${point.getLatLng().lng}&zoom=${map.getZoom()}&format=jsonv2`,{

                referrerPolicy: "strict-origin-when-cross-origin"

        })
                .then(response => response.json())
                .then(async data => {
                    if (event?.code == "Enter") {
                        //console.log(data)
                        if(AdPointer){
                            const poi= AdPointer.secondaryMarker
                            
                            addmarker(poi.getLatLng())
                            updateLiveRegion("Marker placed")
                        }else{
                            placeappear(data)
                        }
                    }
                    name = data.name
                    if (data.error == "Unable to geocode") {
                        name = 'Sea'
                    }
                    if(await isInindiaKashmir(data)){
                        console.log(data)
                        name="India"
                    }
                }).catch(error => {
                    console.error("Error in fetching place name:", error);
                }
                )
        }
        return name
    } else {
        alert("click somewhere first!")
    }
}

function bordertouched(dir) {
    updateLiveRegion("Border touched")
}

document.addEventListener("keydown",function(event){
    if(event.code == "Escape"){
        console.log("heloo esc")
    document.getElementById("closeBtnD").click()// close search details box
    document.getElementById("closeBtn").click()// close search details box
    updateLiveRegion(`closed`,false,"assertive")
    }
    if (event.altKey && event.key === 's') {
        // Prevent default behavior if needed (e.g., avoid browser shortcuts)
        event.preventDefault();
        
        // Focus on the search bar element
        document.getElementById('search-input')?.focus() // Adjust the ID to match your HTML element
    }
})


function calculateHeight(){
  
    let num = 40075016 * Math.cos(marker.getLatLng().lat * Math.PI / 180) / Math.pow(2, map.getZoom() + 8) * 1050
    height = num < 1000 ? parseInt(num) + ' meters' : parseInt(num / 1000) + ' Kilo meters'
    document.getElementById('camera-height').innerText = 'View Height :'+height
  }
const fetchElevation = _.throttle(async (point) => {
    fetch(`https://api.open-elevation.com/api/v1/lookup?locations=${marker.getLatLng().lat},${marker.getLatLng().lng}`)
    .then(response => response.json())
    .then(data => {
        if(data.results[0].elevation){
           document.getElementById("elevation").innerHTML=`Elevation: ${data.results[0].elevation} meters`
        }
    }).catch(error => { console.error("Error in fetching place name:", error); })
},1001)

var marker, place, borderpoints, northDistance, southDistance, westDistance, eastDistance, perkeydist;
const clickSound = new Audio('click.wav');
var pane = map.createPane('customPane')
map.getPane('customPane').style.zIndex = 1000; //for control z index of marker

//function for adding marker
function addmarker(coord) {
    var isGeoPresent = geoLayer ? map.hasLayer(geoLayer) : false;

    if (AdPointer) {
        AdPointer.remove()
        AdPointer = null

    }
    if (marker) {
        let old = marker.getLatLng()//previos marker location
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
        marker.getElement().setAttribute('tabindex', '0')
        marker.getElement().setAttribute('title', 'marker')
        addpoly().then(() => {
            if (!isGeoPresent) {
                place = poly.toGeoJSON()

            }
        })

    }
    if (isGeoPresent) {

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
        marker = null
    }
    if (!AdPointer) {
        AdPointer = new L.AdPointer(coord); // distance in meters, angle in degrees
        AdPointer.addTo(map);
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
document.addEventListener('keydown', function (event) {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.tagName === 'SELECT') {
        return; // Do nothing if the event target is any of the above
    }

    if (event.key == 'a' || event.key == 'w' || event.key == 's') {//enable adpointer
        event.preventDefault();
        if (marker) {
            addAdPointer(marker.getLatLng())
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
            var message = new SpeechSynthesisUtterance();
            message.text = nm;
            speechSynthesis.speak(message);
        })
    }
    if (event.code == 'KeyZ') { // for stating zoom value
        event.preventDefault();
        try {
            let scale = 40075016 * Math.cos(marker.getLatLng().lat * Math.PI / 180) / Math.pow(2, map.getZoom() + 8) * 10
            let zoom = scale < 1000 ? parseInt(scale) + ' meters' : parseInt(scale / 1000) + ' Kilo meters'
            console.log(zoom)
            var zoomLevel = new SpeechSynthesisUtterance()
            zoomLevel.text = zoom;
            speechSynthesis.speak(zoomLevel)
        } catch (error) {
            alert('add marker first')
        }
    }
    if (event.code == 'KeyL') { // locate current user location
        document.getElementById("locateme").click()
    }
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') { //marker movement on map using arrowkeys
        if (!event.shiftKey) {
            perkeydist = 40075016 * Math.cos(marker.getLatLng().lat * Math.PI / 180) / Math.pow(2, map.getZoom() + 8) * 10
            event.preventDefault(); // Prevent the default behavior
            event.stopImmediatePropagation(); // Stop the event from propagating further
            switch (event.key) {
                case 'ArrowUp':
                    if (geoLayer ? map.hasLayer(geoLayer) : false) {
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
                    if (geoLayer ? map.hasLayer(geoLayer) : false) {
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
                    if (geoLayer ? map.hasLayer(geoLayer) : false) {
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
                    if (geoLayer ? map.hasLayer(geoLayer) : false) {
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
                    var distext = new SpeechSynthesisUtterance()
                    distext.text = dis;
                    speechSynthesis.speak(distext)
                    break;

                case 'ArrowDown':
                    dis = southDistance < 1000 ? parseInt(southDistance) + ' meters' : parseInt(southDistance / 1000) + ' Kilo meters'
                    console.log(dis)
                    var distext = new SpeechSynthesisUtterance()
                    distext.text = dis;
                    speechSynthesis.speak(distext)
                    break;

                case 'ArrowLeft':
                    dis = eastDistance < 1000 ? parseInt(eastDistance) + ' meters' : parseInt(eastDistance / 1000) + ' Kilo meters'
                    console.log(dis)
                    var distext = new SpeechSynthesisUtterance()
                    distext.text = dis;
                    speechSynthesis.speak(distext)
                    break;

                case 'ArrowRight':
                    dis = westDistance < 1000 ? parseInt(westDistance) + ' meters' : parseInt(westDistance / 1000) + ' Kilo meters'
                    console.log(dis)
                    var distext = new SpeechSynthesisUtterance()
                    distext.text = dis;
                    speechSynthesis.speak(distext)
                    break;

            }
        }
    }
    if (marker) map.panTo(marker.getLatLng());


});
function fixdist(num) {
    const distanceArray = [1280000, 6400000, 3200000, 1600000, 800000, 400000, 200000, 96000, 48000, 24000, 12000, 6000, 3000, 1500, 700, 350, 150, 100, 50];
    return distanceArray[num];
}
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
            await fetch(`https://nominatim.openstreetmap.org/reverse.php?lat=${point.getLatLng().lat}&lon=${point.getLatLng().lng}&zoom=${map.getZoom()}&format=jsonv2`)
                .then(response => response.json())
                .then(data => {
                    if (event?.code == "Enter") {
                        //console.log(data)
                        placeappear(data)
                    }
                    name = data.name
                    if (data.error == "Unable to geocode") {
                        name = 'Sea'
                    }
                })
        }
        return name
    } else {
        alert("click somewhere first!")
    }
}

function bordertouched(dir) {
    var message = new SpeechSynthesisUtterance(`${dir} Border touched`);
    speechSynthesis.speak(message);
}





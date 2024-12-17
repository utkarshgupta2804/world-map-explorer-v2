let poly
let oname, pname// old name, present name
let flag = true// for avoid repeated fetch
let wentfar = 0
// function to check weather passed the border
const bordercrossSound = new Audio('border-crossing.wav');

function borderCheck(within50) { 
    if (poly) {
        if (((leafletPip.pointInLayer(marker.getLatLng(), poly).length <= 0)) && flag) {
            flag = false
            bordercrossSound.play()
            poly.remove()

            oname = pname 

            addpoly().then((nm) => {
                if (nm.name != "sea(mostly)") {
                    borderCheck(0)
                }
                if ((within50 <= 60) && (nm.name != oname.name)) {
                    if (crossedhigherlevel(oname, pname)) { //if crossed to higher level 
                        console.log(`${oname.display_name} crossed. ${nm.display_name} entered`);
                        
                            updateLiveRegion(`${oname.display_name} crossed. ${nm.display_name} entered`,true)
                        
                        // var message = new SpeechSynthesisUtterance(`${oname.display_name} crossed. ${nm.display_name} entered`);
                        // speechSynthesis.speak(message);
                    } else {
                        console.log();
                        // var message = new SpeechSynthesisUtterance(`${oname.name} crossed. ${nm.name} entered`);
                        // speechSynthesis.speak(message);
                        updateLiveRegion(`${oname.name} crossed. ${nm.name} entered`,true)


                    }
                    if (wentfar >= 7) {
                        console.log("May be went too far")
                        quu+="May be went too far"
                        
                        wentfar = 0
                    }
                }
                // Code to execute after addpoly finishes (success)
                if (!isGeoPresent()) {
                    place = poly.toGeoJSON();
                }
                if (isGeoPresent()) {
                    place = geoLayer.toGeoJSON();
                } else if (poly ? map.hasLayer(poly) : false) {
                    place = poly.toGeoJSON();
                }
                if (place) {
                    borderpoints = findborderpoints();
                    northDistance = L.latLng(borderpoints.north).distanceTo(marker.getLatLng());
                    southDistance = L.latLng(borderpoints.south).distanceTo(marker.getLatLng());
                    eastDistance = L.latLng(borderpoints.east).distanceTo(marker.getLatLng());
                    westDistance = L.latLng(borderpoints.west).distanceTo(marker.getLatLng());
                }
                fetchElevation();
            }).catch(error => {
                console.error("Error in addpoly:", error);
            });


        } else {
            if (!flag) {
                wentfar++
            }
        }

    } else {
        addpoly()
    }
}
let controller = null
let errorCount = 0

//function for fetching and adding polygon to map
async function addpoly() {
    return new Promise(async (resolve, reject) => {
        if (controller) {
            controller.abort();
        }
        controller = new AbortController();
        const signal = controller.signal;

        try {
            const response = await fetch(`${geocodingAPI}/reverse.php?lat=${marker.getLatLng().lat}&lon=${marker.getLatLng().lng}&zoom=${getZooom()}&format=geojson&polygon_geojson=1&polygon_threshold=${1/(Math.pow(map.getZoom(),3))}`, {
                signal: signal, // The signal object for cancellation
                referrerPolicy: "strict-origin-when-cross-origin" // The referrer policy
            })
            let data = await response.json();
            
            // Extract pname from the data
            pname = data.features[0].properties;

            // Check if the name is "India" and fetch additional data if true
            if (data.features[0].properties.name === "India") {
                data = await fetchindia();
            }
            if(await isInindiaKashmir(pname)){
            pname = { name: "India", display_name: "India" };
            data = await fetchindia();
            }
            osmIds.forEach((value)=>{
                if (value==pname.osm_id){
                  data = turf.difference(data.features[0], Kashmir.features[0]);
                }
              })
            poly && poly.remove()
            // Create and add the GeoJSON layer to the map
             poly = L.geoJson(data, {
                fillOpacity: 0
            });
            poly.addTo(map);
            poly.bringToBack();

            // Resolve pname and set flag
            flag = true;
            resolve(pname);
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                // Handle abort errors
                errorCount++;
                if (errorCount > 5) {
                    console.log("You're going too fast");
                    errorCount = 0;
                }
            } else if (error instanceof TypeError) {
                // Handle TypeError

                pname = { name: "sea(mostly)", display_name: "sea(mostly)" };
            } else {
                // Log other errors
                console.error(error);
            }
            // Fallback pname for errors
            pname = { name: "sea(mostly)", display_name: "sea(mostly)" };
            flag = true;
            resolve(pname);
        }
    });
}
// for fixing district minimum view
function getZooom() {
    if (map.getZoom() >= 8) {
        return 6
    } else if (map.getZoom() >= 5 && map.getZoom() <= 7) {
        return 5
    } else if (map.getZoom() <= 4) {
        return 2
    }
}

function threshold(x) {
    return 0.002 + (0.02 - 0.002) * (x / 18);
}
map.on('zoomend', function (e) {
    if (poly) {
        poly.remove()
        if (marker) {
            addpoly().then(()=>{
                place = poly.toGeoJSON()
                addmarker(marker.getLatLng())

            })
        }
        //console.log(getZooom())
    }
})
function crossedhigherlevel(cro, ent) {
    if (ent.place_rank >= 10) {
        if (
            (ent.address?.state !== cro.address?.state) ||
            (ent.address?.province !== cro.address?.province) ||
            (ent.address?.country !== cro.address?.country)
        ) {
            return true
        } else {
            return false
        }
    } else if (ent.place_rank >= 8) {
        if (
            (ent.address?.country !== cro.address?.country)
        ) {
            return true
        } else {
            return false
        }
    }
}

mape.addEventListener("focusin",()=>{
    successSound.play()
    findplacename(marker).then((place)=>{
        updateLiveRegion(`Now marker is in ${place}`,true)
    })
  })


fetch('https://ipinfo.io/json')
  .then(response => response.json())
  .then(data => {
      const [lat, lon] = data.loc.split(',');
      console.log(data)
      map.setView([lat, lon], 7)
  })
  .catch(error => {
map.setView([10.16,76.64],7)
  }).finally(()=>{
    addmarker(map.getCenter())
  calculateHeight()

  })


import { tileLayer } from "./Layers/tileLayer.js";
import { toKMorMeter } from "./Util/misc.js";
import { notifySreenReader } from "./Util/accessibility.js";

export var map = L.map("map", {
  keyboardPanDelta: 0,
}); //creates a map object and sets the view to the given coordinates and zoom level

tileLayer.addTo(map); //adds the tile layer to the map
window.map = map; //exports the map object
map.on(
  'zoomend',
  function () {
    notifySreenReader(`Zoom level ${map.getZoom()}`, true);
    calculateHeight();
  }.bind(this)
);

map.on('keydown', (event) => {
  if (event.originalEvent.code == "KeyL") {
    console.log("key pressed");
    document.getElementById("locateme").click();
  }
});
map.on("locationfound", function (e) {
  // notifySreenReader("You are here", true);
  marker && marker.setLatLng(e.latlng);
});
map.on("locationerror", function (e) {
  notifySreenReader(
    e.code == 1 ? "Please grant loacation permission" : e.message,
    true
  ); // Handle the error appropriately (e.g., show an alert or a fallback message)
  alert(
    e.code == 1 ? "Please grant loacation permission" : e.message
  ); // Handle the error appropriately (e.g., show an alert or a fallback message)
});

var pane = map.createPane('customPane');
map.getPane('customPane').style.zIndex = 1000;



function calculateHeight() {
    let num =
        ((40075016 * Math.cos((map.getCenter().lat * Math.PI) / 180)) /
            Math.pow(2, map.getZoom() + 8)) *
        1050;
    notifySreenReader(document.getElementById("camera-height").innerText = "View Height :" + toKMorMeter(num))
}


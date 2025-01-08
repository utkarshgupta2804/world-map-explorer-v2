/* 
this is the main file for the Application this need to be loaded first.

this contains the following functions:
  - set up the map and leaflet
  - Correctly loads the map and the boundary lines of India
  - Adds event listeners for the zoom in and zoom out buttons
  - Adds event listener for the location button
  - Adds event listener for the layers button, geographical layer and political layer
  - Adds a scale to the map
  - Adds event listeners for the map, necessary key shortcuts
  - Adds event listeners for the document, necessary Application  key shortcuts

*/
import {map} from "/public/components/map.js"; //imports the map object from map.js
//import { TopBoundary } from "../assets/boundary.js"; //imports the boundary data of top border of india
import { locationArrow, minusIcon, plusIcon } from "../components/DOM.js";
import { generalEvents } from "../components/generalEvents.js";
import { handleKeyDownOnDocument, MapEventListeners, perKeyDist } from "../components/keyShortcuts.js"; 
import { addmarker,marker, place } from "../components/marker.js";
import { calculateHeight } from "../components/misc.js"; // imports function to calculate view height of the map
import { findplaceNamAandData } from "../components/nominatim.js";
import { successSound } from "../components/sounds.js";
import { notifySreenReader } from "/public/components/accessibility.js"; //imports function to update live region
import { boundaryStyle } from "/public/components/fetchindia.js"; // imports function to style boundaries of india to match map colors
import { addIndiaBoundaries } from "../components/fetchindia.js";
import { getBorder, poly } from "../components/borderCross.js";

var geographicalLayerBtn = document.getElementById("geographical-layer"); //gets the geographical layer button element
var politicalLayerBtn = document.getElementById("political-layer"); //gets the political layer button element



addIndiaBoundariess();
   //fetches the boundary data and adds it to the map

var borderpane = map.createPane("borderPane"); //creates a pane for the boundary lines to make them appear below the other map drawings
map.getPane("borderPane").style.zIndex = 200; //sets the z-index of the boundary lines to 200 to make them appear below the other map drawings
var indiaBoundaries; //variable to store the boundary lines that is leaflet geojson object
async function addIndiaBoundariess() {
  indiaBoundaries = L.geoJSON(await addIndiaBoundaries(), {
    style: boundaryStyle,
    pane: "borderPane",
  }).addTo(map);
} //function to add the boundary lines to the map


//Zoom in listeners

map.getContainer().addEventListener("keydown", function (event) {
  if (event.key === "+" || event.key === "-") {
    event.preventDefault();
  }
  if (event.key === "+") {
    map.zoomIn();
  } else if (event.key === "-") {
    map.zoomOut();
  }
});





//Event listener for location button




// Event listener for layers button

// Toggle visibility of layers dropdown

// Event listener for geographical layer
geographicalLayerBtn.addEventListener("click", function () {
  // Add your logic to switch to the geographical layer
  console.log("Switching to Geographical Layer");
  layersDropdown.style.display = "none"; // Hide dropdown
  tileLayer.remove();
  tileLayer = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,

    attribution:
      'Map data: &copy; <a href="https://www.opentopomap.org">OpenTopoMap</a>',
    noWrap: true,
    tabindex: 0,
  });
  tileLayer.addTo(map);
  notifySreenReader("Switched to geograhical map");
});
// Event listener for political layer
politicalLayerBtn.addEventListener("click", function () {
  // Add your logic to switch to the political layer
  console.log("Switching to Political Layer");
  layersDropdown.style.display = "none"; // Hide dropdown
  tileLayer.remove();
  tileLayer = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>',
      noWrap: true,
      tabindex: 0,
    }
  );
  tileLayer.addTo(map);
  notifySreenReader("Switched to political map");
});

L.control.scale().addTo(map); // this adds the visible scale to the map
map.addEventListener("keydown",MapEventListeners ) //adds event listeners for the map, necessary key shortcuts
document.addEventListener("keydown", handleKeyDownOnDocument); //adds event listeners for the document, necessary Application  key shortcuts
map.addEventListener("focusin",()=>{
  successSound.play()
  findplaceNamAandData(marker).then((place)=>{
      notifySreenReader(`Now marker is in ${place.name}`,true)
  })
})


 //fetches the user's location and sets the view of the map to the user's location
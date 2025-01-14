import { initialize_DistanceFinder_EventListeners } from "./components/DistanceFinder/distance.js";
import { addListenerstoUI } from "./layout/add-listeners-to-ui.js";
import { map } from "./components/map.js";
import { Marker } from "./components/Marker/marker.js";
import { handleKeyDownOnDocument } from "./utils/key-shortcuts.js";
import { addDisclaimer } from "./layout/disclaimer.js";
let marker

fetch('https://ipinfo.io/json') //fetching the location of the user and setting the map to that location, if failed then setting it to the default location
  .then(response => response.json())
  .then(data => {
      const [lat, lon] = data.loc.split(',');
      console.log(data)
      map.setView([lat, lon], 7)
  })
  .catch(error => {
map.setView([10.16,76.64],7)
  }).finally(()=>{
    window.marker = new Marker(map.getCenter()).addTo(map)
  })
document.addEventListener('keydown',handleKeyDownOnDocument) // Initialize event listeners for key shortcuts on the document, general any time shortcuts
addListenerstoUI() // Initialize event listeners for the UI elements on the page
initialize_DistanceFinder_EventListeners(); // Initialize event listeners for the distance finder
addDisclaimer() // Add a disclaimer to the UI
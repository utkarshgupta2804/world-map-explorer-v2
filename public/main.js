import { initialize_DistanceFinder_EventListeners } from "../src/components/DistanceFinder/distance.js";
import { map } from "../src/components/map.js";
import { Marker } from "../src/components/Marker/mobile-marker.js";
import { handleKeyDownOnDocument } from "../src/components/Util/keyShortcuts.js";
let marker

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
    window.marker = new Marker(map.getCenter()).addTo(map)
  })
document.addEventListener('keydown',handleKeyDownOnDocument)
 initialize_DistanceFinder_EventListeners(); // Initialize event listeners for the distance finder
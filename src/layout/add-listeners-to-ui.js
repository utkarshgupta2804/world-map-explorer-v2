import { tileLayerGeographical, tileLayerPolitical } from '../components/tile-layer.js';
import { geoLayer } from '../services/fetch-place.js';
import { mainsearchbar } from '../components/Search/search.js';
import { detailsCloseButton } from '../utils/dom-elements.js';
import { fetchCurrentLocation } from '../services/current-location.js';
import { generalEvents } from '../utils/general-events.js';
import { closeSound } from '../utils/sounds.js';
import { map } from '../components/map.js';



let layersBtn = document.getElementById('layers-btn'); //gets the layers button element
let layersDropdown = document.getElementById('layers-dropdown'); //gets the layers dropdown element

let geographicalLayerBtn = document.getElementById("geographical-layer"); //gets the geographical layer button element
let politicalLayerBtn = document.getElementById("political-layer"); //gets the political layer button element

let locationArrow = document
  .getElementById('controls-box')
  .querySelector('.fa-location-arrow');
let plusIcon = document
  .getElementById('controls-box')
  .querySelector('.fa-plus');
let minusIcon = document
  .getElementById('controls-box')
  .querySelector('.fa-minus');



export function addListenerstoUI(){
  
layersBtn.addEventListener('click', function () {
  layersDropdown.style.display =
    layersDropdown.style.display === 'block' ? 'none' : 'block';
});

locationArrow.addEventListener('click', fetchCurrentLocation);

plusIcon.addEventListener('click', function () {
  map.zoomIn();
});

minusIcon.addEventListener('click', function () {
  map.zoomOut();
});

document.getElementById('search-input').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    mainsearchbar();
  }
});
document.getElementById('searchbutton').addEventListener('click', function (e) {
  mainsearchbar();
});
document.addEventListener('click', generalEvents);


detailsCloseButton.addEventListener('click', function () {
  closeSound.play()
  document.getElementById("searchdetails").style.display = "none";
  if (geoLayer != null) {
    geoLayer.remove();
  }
})




  geographicalLayerBtn.addEventListener("click", function () {
    // Add your logic to switch to the geographical layer
    console.log("Switching to Geographical Layer");
    layersDropdown.style.display = "none"; // Hide dropdown
    tileLayerPolitical.remove();
    tileLayerGeographical.addTo(map);
    notifySreenReader("Switched to geograhical map");
  });
  // Event listener for political layer
  politicalLayerBtn.addEventListener("click", function () {
    // Add your logic to switch to the political layer
    console.log("Switching to Political Layer");
    layersDropdown.style.display = "none"; // Hide dropdown
    tileLayerGeographical.remove();
    tileLayerPolitical.addTo(map);
    notifySreenReader("Switched to political map");
  });
}
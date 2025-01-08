import { mainsearchbar } from '../Search/search.js';
import { fetchCurrentLocation } from '../Util/current-location.js';
import { generalEvents } from '../Util/generalEvents.js';
import { map } from '../map.js';

let layersBtn = document.getElementById('layers-btn'); //gets the layers button element
let layersDropdown = document.getElementById('layers-dropdown'); //gets the layers dropdown element
let locationArrow = document
  .getElementById('controls-box')
  .querySelector('.fa-location-arrow');
let plusIcon = document
  .getElementById('controls-box')
  .querySelector('.fa-plus');
let minusIcon = document
  .getElementById('controls-box')
  .querySelector('.fa-minus');

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

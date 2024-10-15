
// disclaimer part

const disclaimer = document.createElement('div');
disclaimer.id = 'disclaimer';
disclaimer.setAttribute('role', 'alert');
disclaimer.setAttribute('aria-label', 'Disclaimer');

const message = document.createElement('p');
message.setAttribute("tabindex", 1);
message.setAttribute("aria-atom","true");
message.id = 'messagec';
const messageContainer = document.createElement('div');
messageContainer.id='message';
message.innerHTML = `<p>
    <strong>Welcome to World Map Explorer</strong><br><br>
    Please note the following:<br>
    <ol>
        <li>This application uses OpenStreetMap (OSM) data for map information.</li>
        <li>OSM is responsible for the maintenance and accuracy of the map.</li>
        <li>The routing engine used in this application is Valhalla, which provides navigation routes.</li>
        <li>For users navigating markers:<br>
            &nbsp;&nbsp;&nbsp;&nbsp;- On GNU/Linux systems, please use <strong>Focus Mode</strong>.<br>
            &nbsp;&nbsp;&nbsp;&nbsp;- On Windows, disable <strong>Scan Mode</strong> for proper marker navigation.</li>
        <li>By using this application, you agree to the terms and limitations of OSM and Valhalla routing services.</li>
    </ol>
    Thank you for using World Map Explorer!
</p>
`;

const closeButton = document.createElement('button');
closeButton.id = 'close-button';
closeButton.setAttribute('aria-label', 'Close Disclaimer');
closeButton.textContent = 'X';

closeButton.addEventListener('click', () => {
  document.removeEventListener('keydown', handleKeyDown);
  disclaimer.remove();
});

message.appendChild(closeButton);

messageContainer.appendChild(message);
disclaimer.appendChild(messageContainer);
document.body.prepend(disclaimer);
function handleKeyDown(event) {
  if (event.keyCode === 9) {
    event.preventDefault();
      if(document.activeElement.id === 'messagec'){
        closeButton.focus();
        console.log('close button focused')
      }
      else if(document.activeElement.id === 'close-button'){
        message.focus();
        console.log('message focused')
      }
  }
}
document.addEventListener('keydown', handleKeyDown);
// disclaimer part ends

var indiaBoundayLines
fetch('boundary.geojson')
  .then(response => response.json())
  .then(data => {
    indiaBoundayLines = data
  }).then(dat => {
    addIndiaBoundaries();
  })
var map = L.map('map',{
  keyboardPanDelta: 0

}).setView([10.16,76.64], 7);
// add the OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>',
  noWrap: true,
  tabindex: 0,
}).addTo(map);



var indiaBoundaries;

function addIndiaBoundaries() {
  // this function adds the boundaries with the style's weight determined
  // by the current zoom level
  indiaBoundaries = L.geoJSON(indiaBoundayLines, {
    style: boundaryStyle
  }).addTo(map);
}



function boundaryStyle(feature) {
  // the weight is a function of the current map scale
  var wt;
  wt = map.getZoom() / 4;
  switch (feature.properties.boundary) {
    case 'disputed':
      return {
        color: "#f2efea", weight: wt * 2,
      };
    case 'claimed':
      return {
        color: "#b9a8b9", weight: wt
      };
  }
}

// whenever the zoom level changes, remove the layer and re-add it to 
// force the style to update based on the current map scale
map.on("zoomend", function () {
  indiaBoundaries.removeFrom(map);
  addIndiaBoundaries();
  updateLiveRegion(`zoom level ${map.getZoom()}`)
});
L.control.scale().addTo(map);

//Zoom in functions using + and - buttons
map.getContainer().addEventListener('keydown', function (event) {
  if (event.key === '+' || event.key === '-') {
    event.preventDefault();
  }
  if (event.key === '+') {
    map.zoomIn();
    
  } else if (event.key === '-') {
    map.zoomOut();
  }
});
// Event listener for zoom in
document.getElementById('controls-box').querySelector('.fa-plus').addEventListener('click', function () {
  map.zoomIn();
  updateLiveRegion(`zoom level. ${map.getZoom()}`)
});
// Event listener for zoom out
document.getElementById('controls-box').querySelector('.fa-minus').addEventListener('click', function () {
  map.zoomOut();
  updateLiveRegion(`zoom level. ${map.getZoom()}`)

});
//Event listener for navigation 

document.getElementById('controls-box').querySelector('.fa-location-arrow').addEventListener('click', function () {


  map.locate({ setView: true, maxZoom: 16 })
  map.on('locationfound', function (e) {
    addmarker(e.latlng)
  });
 

});
// Event listener for layers button
var layersDropdown = document.getElementById('layers-dropdown');
var layersBtn = document.getElementById('layers-btn');
var geographicalLayerBtn = document.getElementById('geographical-layer');
var politicalLayerBtn = document.getElementById('political-layer');
// Toggle visibility of layers dropdown
layersBtn.addEventListener('click', function () {
  layersDropdown.style.display = (layersDropdown.style.display === 'block') ? 'none' : 'block';
});
// Event listener for geographical layer
geographicalLayerBtn.addEventListener('click', function () {
  // Add your logic to switch to the geographical layer
  console.log('Switching to Geographical Layer');
  layersDropdown.style.display = 'none'; // Hide dropdown
  L.tileLayer( "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
   
  attribution:'Map data: &copy; <a href="https://www.opentopomap.org">OpenTopoMap</a>',
    noWrap: true,
    tabindex: 0,
  }).addTo(map);
  updateLiveRegion("switched to geograhical map")
});
// Event listener for political layer
politicalLayerBtn.addEventListener('click', function () {
  // Add your logic to switch to the political layer
  console.log('Switching to Political Layer');
  layersDropdown.style.display = 'none'; // Hide dropdown
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    noWrap: true,
    tabindex: 0,
  }).addTo(map);
  updateLiveRegion("switched to political map")

});

function fetchindia() {
  return new Promise((resolve, reject) => {
    fetch(`india-osm.geojson`)
      .then(response => response.json())
      .then(data => {
        resolve(data)
      })
  })

}





function updateLiveRegion(text, priority) {
  var el = document.createElement("div");
  var id = "speak-" + Date.now();
  el.setAttribute("id", id);
  el.setAttribute("aria-live", priority || "polite");
  el.classList.add("visually-hidden");
  document.body.appendChild(el);

  window.setTimeout(function () {
    document.getElementById(id).innerHTML = text;
  }, 1000);

  window.setTimeout(function () {
    document.body.removeChild(document.getElementById(id));
  }, 10000);
}


function notifyLoading() {
  updateLiveRegion("Loading.")
  // Add your logic here
}

// Set the interval (2000ms = 2 seconds)
let Loadinginterval 
mape.focus()

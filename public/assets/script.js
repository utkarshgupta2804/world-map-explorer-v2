
let timer=null
var map
var height
// disclaimer part
const geocodingAPI = 'https://nominatim.geocoding.ai';
const disclaimer = document.createElement('div');
let staringPoint
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
        <li>This application uses OpenStreetMap (OSM) data for map information. OSM is responsible for the maintenance and accuracy of the map</li>
        
        <li>For users navigating markers with screen readers:<br>
            &nbsp;&nbsp;&nbsp;&nbsp;- For NVDA users, press <strong>Insert+Space</strong> to toggle Focus Mode.<br>
            &nbsp;&nbsp;&nbsp;&nbsp;- For JAWS users, press <strong>Insert+Z</strong> to disable Virtual Cursor.<br>
            &nbsp;&nbsp;&nbsp;&nbsp;- For ORCA users, press <strong>Insert+Z</strong> to toggle Focus Mode.<br>
            &nbsp;&nbsp;&nbsp;&nbsp;- For VoiceOver users, press <strong>Control+Option+Shift+U</strong> to interact with markers.</li>
    </ol>
    Thank you for using World Map Explorer!
</p>`;


const closeButton = document.createElement('button');
closeButton.id = 'close-button';
closeButton.setAttribute('aria-label', 'Close Disclaimer');
closeButton.textContent = 'X';

closeButton.addEventListener('click', () => {
  document.removeEventListener('keydown', handleKeyDown);
  disclaimer.remove();
  closeSound.play()
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
window.onload = function () { 
  message.focus();
}

var indiaBoundayLines
fetch('boundary.geojson')
  .then(response => response.json())
  .then(data => {
    indiaBoundayLines = data
  }).then(dat => {
    addIndiaBoundaries();
  })
  map = L.map('map',{
    keyboardPanDelta: 0
  
  }).setView([0,0], 2);

 
  




var borderpane = map.createPane('borderPane')
map.getPane('borderPane').style.zIndex = 200;
// add the OpenStreetMap tiles
var tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>',
  noWrap: true,
  tabindex: 0,
})
tileLayer.addTo(map);


var indiaBoundaries;

function addIndiaBoundaries() {
  // this function adds the boundaries with the style's weight determined
  // by the current zoom level
  indiaBoundaries = L.geoJSON(indiaBoundayLines, {
    style: boundaryStyle,
    pane:'borderPane'
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
  calculateHeight()
  indiaBoundaries.removeFrom(map);
  addIndiaBoundaries();
  updateLiveRegion(`Zoom level ${map.getZoom()}`,true)
  updateLiveRegion(`View height ${height}`)
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
  updateLiveRegion(`Zoom level. ${map.getZoom()}`,true)
});
// Event listener for zoom out
document.getElementById('controls-box').querySelector('.fa-minus').addEventListener('click', function () {
  map.zoomOut();
  updateLiveRegion(`Zoom level. ${map.getZoom()}`,true)

});
//Event listener for navigation 

document.getElementById('controls-box').querySelector('.fa-location-arrow').addEventListener('click', function () {


  map.locate({ setView: true, maxZoom: 16 })
  map.on('locationfound', function (e) {
    addmarker(e.latlng)
  });
  map.on('locationerror', function (e) {
    updateLiveRegion(e.code==1?'Please grant loacation permisson':e.message,true)    // Handle the error appropriately (e.g., show an alert or a fallback message)
    alert(e.code==1?'Please grant loacation permisson':e.message,true)    // Handle the error appropriately (e.g., show an alert or a fallback message)
  })

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
  tileLayer.remove();
  tileLayer = L.tileLayer( "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
   
  attribution:'Map data: &copy; <a href="https://www.opentopomap.org">OpenTopoMap</a>',
    noWrap: true,
    tabindex: 0,
  })
  tileLayer.addTo(map);
  updateLiveRegion("Switched to geograhical map")
});
// Event listener for political layer
politicalLayerBtn.addEventListener('click', function () {
  // Add your logic to switch to the political layer
  console.log('Switching to Political Layer');
  layersDropdown.style.display = 'none'; // Hide dropdown
  tileLayer.remove();
  tileLayer=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    noWrap: true,
    tabindex: 0,
  })
  tileLayer.addTo(map);
  updateLiveRegion("Switched to political map")

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





function updateLiveRegion(text,view, priority) {
  var el = document.createElement("div");
  var id = "speak-" + Date.now();
  el.setAttribute("id", id);
  el.setAttribute("aria-live", priority || "polite");
  el.classList.add("visually-hidden");
  document.body.appendChild(el);
let statusBar =document.getElementById('status-bar')
if(view){
statusBar.innerText=text
}

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
let Kashmir
fetch('kashmir.geojson')
  .then(response => response.json())
  .then(data => {
    Kashmir = data
  })



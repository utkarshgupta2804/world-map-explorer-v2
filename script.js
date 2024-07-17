


var map = L.map('map').setView([10.903219337541, 76.43448118177776], 13);
//Adding map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Leaflet | © OpenStreetMap contributors'
}).addTo(map);

//Preventing default behavior for zoom in and zoom out keys
document.addEventListener('keydown', function (event) {
    if(event.keycode === 109 || event.keycode === 107) {    //  + or - keys
        event.preventDefault();
    }
    if(event.keycode === 107) {
        map.zoomIn();
    }
    else if(event.keycode ===109) {
        map.zoomOut();
    }
})

// Event listener for zoom in
document.getElementById('controls-box').querySelector('.fa-plus').addEventListener('click', function () {
    map.zoomIn();
});
// Event listener for zoom out
document.getElementById('controls-box').querySelector('.fa-minus').addEventListener('click', function () {
    map.zoomOut();
});
//Event listener for navigation 

document.getElementById('controls-box').querySelector('.fa-location-arrow').addEventListener('click', function () {
   
        
        map.locate({setView: true, maxZoom: 16})
        map.on('locationfound', function(e) {
            addmarker(e.latlng)
        });
       // map.setZoom(12)
    
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
});
// Event listener for political layer
politicalLayerBtn.addEventListener('click', function () {
    // Add your logic to switch to the political layer
    console.log('Switching to Political Layer');
    layersDropdown.style.display = 'none'; // Hide dropdown
});
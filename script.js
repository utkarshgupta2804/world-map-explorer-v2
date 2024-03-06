var map = L.map('map').setView([10.903219337541, 76.43448118177776], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Leaflet | © OpenStreetMap contributors'
}).addTo(map);

var marker;
map.on('click', function (event) {
    if (marker) {
        map.removeLayer(marker);
    }
    marker = L.marker(event.latlng).addTo(map);
});
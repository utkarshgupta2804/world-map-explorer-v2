import { distanceBox } from "../../utils/dom-elements.js";
import { geoLayer } from "../../services/fetch-place.js";
import { performSearch } from "../../services/do-search.js";
import { toKMorMeter } from "../../utils/misc.js";
import { closeSound } from "../../utils/sounds.js";
import { FOSSGISValhallaEngine } from "./FOSSGISValhallaEngine.js";

// Element for user input of the starting location
export let startingLocationElement = document.getElementById("beginning");  
// Element for user input of the destination location
export let destinationLocationElement = document.getElementById("destination");

// Coordinates for the destination
let destinationCoordinates;
// Coordinates for the starting location
let startingCoordinates;
// Layer group to represent the road path on the map
let roadPathLayerGroup;

// Function to handle search and selection of the starting location
export function handleStartingLocationSearch() {
    performSearch(startingLocationElement, [])
        .then((result) => {
            startingCoordinates = {
                lat: parseFloat(result.lat),
                lon: parseFloat(result.lon),
            };
            startingLocationElement.value = result.name;
            document.getElementById("search-results")?.remove();
        })
        .catch((error) => {
            console.error("Error fetching search results:", error);
        });
}

// Function to handle search and selection of the destination location
export function handleDestinationSearch() {
    performSearch(destinationLocationElement, [])
        .then((result) => {
            destinationCoordinates = {
                lat: parseFloat(result.lat),
                lon: parseFloat(result.lon),
            };
            console.log(destinationCoordinates);
            destinationLocationElement.value = result.name;
            document.getElementById("search-results")?.remove();
        })
        .catch((error) => {
            console.error("Error fetching search results:", error);
        });
}

// Function to calculate and display the distance between the starting and destination locations
export function calculateDistance() {
    this.style.pointerEvents = 'none';
    this.innerHTML = `<i class="fas fa-circle-notch fa-spin"></i>`;
    this.className = '';

    const routePoints = [startingCoordinates, destinationCoordinates];
    const route = FOSSGISValhallaEngine("route", "auto", routePoints);

    route.getRoute(function (error, route) {
        this.style.pointerEvents = 'auto';
        this.innerHTML = '';
        this.className = 'fas fa-arrow-circle-right';

        if (!error) {
            // Add the route line to the map
            if (geoLayer != null) {
                geoLayer.remove();
            }
            if (roadPathLayerGroup) {
                roadPathLayerGroup.remove();
            }
            marker.clearGeoJson();
            roadPathLayerGroup = L.featureGroup();

            const path = L.polyline(route.line, { color: "blue" }).addTo(roadPathLayerGroup);

            L.circleMarker(path.getLatLngs()[0], { //adding starting point to map
                fillColor: "red",
                stroke: false,
                fillOpacity: 1,
                radius: 5,
            }).addTo(roadPathLayerGroup);

            L.circleMarker(path.getLatLngs()[path.getLatLngs().length - 1], { //adding destination point to map
                fillColor: "green",
                stroke: false,
                fillOpacity: 1,
                radius: 5,
            }).addTo(roadPathLayerGroup);

            roadPathLayerGroup.addTo(map);
            map.fitBounds(roadPathLayerGroup.getBounds());

            document.getElementById("dist").innerHTML = toKMorMeter(route.distance*1000)
            dist.text = `Distance: ${toKMorMeter(route.distance*1000)}`;
            const timeElement = document.getElementById("time");
            if (route.time < 60) {
                timeElement.innerHTML = `${route.time} Minutes`;
                dist.text += `Time: ${route.time} Minutes`;
            } else {
                const hrs = parseInt(route.time / 60);
                const min = route.time % 60;
                timeElement.innerHTML = `${hrs} Hours ${min} Minutes`;
                dist.text += `Time: ${hrs} Hours ${min} Minutes`;
            }

            notifySreenReader(dist.text);
            document.getElementById("distanceResult").style.display = "block"; //showing the distance result
        } else {
            const errorData = JSON.parse(route.responseText);
            if (errorData.error_code === 130) {
                alert("Failed to parse locations. Please ensure to select a valid location from suggestions.");
            } else {
                alert(errorData.error);
            }
        }
    }.bind(this));
}

// Function to close and reset the distance finder UI
export function closeDistanceFinder() {
    if (roadPathLayerGroup) {
        roadPathLayerGroup.remove();
        roadPathLayerGroup = null;
    }
    closeSound.play();
    document.getElementById("distanceResult").style.display = "none";
    startingLocationElement.value = "";
    destinationLocationElement.value = "";
    distanceBox.style.display = "none";
}

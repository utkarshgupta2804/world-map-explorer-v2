
import { map } from '/src/components/map.js';


var indiaBoundaries; //variable to store the boundary lines that is leaflet geojson object


var borderpane = map.createPane("borderPane"); //creates a pane for the boundary lines to make them appear below the other map drawings
map.getPane("borderPane").style.zIndex = 200; //sets the z-index of the boundary lines to 200 to make them appear below the other map drawings

  
  export async function getIndiaBoundary() { //function to add the boundary lines to the map
    fetch('/src/assets/geojson/boundary.geojson')
      .then(response => response.json())
      .then(data => {
        return data
      });
  } //function to add the boundary lines to the map

  export async function fetchIndia() {
    return fetch('/src/assets/geojson/india-osm.geojson')
      .then(response => response.json())
      .then(data => {
        return data
      });
  } //function to fetch the boundary data of india

  export async function fetchKashmir() {
    return fetch('/src/assets/geojson/kashmir.geojson')
      .then(response => response.json())
      .then(data => {
        return data
      });
  }




  //fetches the boundary data of correct India and adds it to the map
export async function addIndiaBoundaries() { 
  const data = await getIndiaBoundary() //temporary storage of the boundary data
 indiaBoundaries = L.geoJSON(data, {
   style: boundaryStyle(data),
   pane: "borderPane",
 }).addTo(map);
} //function to add the boundary lines to the map

function boundaryStyle(feature) {  //function to style the boundary lines of disputed and claimed territories
  // the weight is a function of the current map scale
  var wt;
  console.log(feature, "feature")
  wt = map.getZoom() / 4;
  switch (feature.properties.boundary) {
    case 'disputed':
      console.log("disputed")
      return {
        color: "#f2efea", weight: wt * 2,
      };
    case 'claimed':
      console.log("claimed")
      return {
        color: "#b9a8b9", weight: wt
      };
  }
}

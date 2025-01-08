
import { map } from '/src/components/map.js';


  export function boundaryStyle(feature) {  //function to style the boundary lines of disputed and claimed territories
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

  export async function addIndiaBoundaries() { //function to add the boundary lines to the map
    fetch('/src/assets/boundary.geojson')
      .then(response => response.json())
      .then(data => {
        return data
      });
  } //function to add the boundary lines to the map

  export async function fetchindia() {
    return fetch('/src/assets/india-osm.geojson')
      .then(response => response.json())
      .then(data => {
        return data
      });
  } //function to fetch the boundary data of india

  export async function fetchKashmir() {
    return fetch('/src/assets/kashmir.geojson')
      .then(response => response.json())
      .then(data => {
        return data
      });
  }
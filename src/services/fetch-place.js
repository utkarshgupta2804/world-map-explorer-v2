import { det } from '../Util/dom-elements.js';
import { notifyLoading, notifySreenReader } from '../Util/accessibility.js';
import { isInindiaKashmir } from "../services/nominatim.js";
import { fetchDetails } from '../components/Search/place-details.js';
import { removeResults } from '../services/do-search.js';
import { successSound } from '../Util/sounds.js';
import { geocodingAPI } from '../Util/misc.js';
import { fetchIndia } from '../services/fetch-india.js';
import { map } from '../components/map.js';

export var geoLayer;//for storing geojson layer other than boundary(like points and lines)
const Options = {
  color: 'red', // Border color
  fillColor: 'yellow',
  fillOpacity: 0.5, // Adjust fill opacity as needed
};

export const osmIds = [
  307573, 270056, 153310, 2748339, 2748436, 1997914, 153292,
];

export async function placeappear(result) {
  geoJSON(result.osm_type, result.osm_id);
  removeResults();
  det.parentElement.style.display = 'block';
  det.innerHTML =
    '<h2 style="padding:50px; text-align: center; justify-content: center; align-items: center;"><i class="fas fa-circle-notch fa-spin"></h2>';
  let Loadinginterval = setInterval(notifyLoading, 2000);
  fetchDetails(result)
    .then(async (data) => {
      successSound.play();
      notifySreenReader('details ready');

      if (await isInindiaKashmir(marker,result)) {
        det.innerHTML = 'No data found for this region';
      } else {
        det.innerHTML = data;
      }
      det.focus();
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => {
      clearInterval(Loadinginterval);
    });
}

async function geoJSON(type, id) {
  geoLayer && geoLayer?.remove();
  marker.clearGeoJson() //removing if there any already
  var result = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body:
      'data=' +
      encodeURIComponent(`
            [out:json][timeout:25];(${type}(${id}););out geom;`),
  }).then((data) => data.json());

  result = osmtogeojson(result); //converting JSON to geoJSON
  if (result.features[0].properties.name === 'India') {
    result = await fetchIndia();
  }
  osmIds.forEach((value) => {
    // deduct kashmir parts from china and pak
    if (value == id) {
      result = turf.difference(result.features[0], Kashmir.features[0]);
    }
  });
  let centre; // = turf.centerOfMass(result);
  try {
    const addressData = await fetch(
      `${geocodingAPI}/details.php?osmtype=${type.trim().charAt(0).toUpperCase()}&osmid=${id}&addressdetails=1&format=json`,
      {
        referrerPolicy: 'strict-origin-when-cross-origin',
      }
    ).then((response) => response.json());
    centre = addressData.geometry.coordinates.reverse();
  } catch (error) {
    centre = turf.centerOfMass(result);
    centre = centre.geometry.coordinates.reverse();
  }
  if(leafletPip.pointInLayer(L.latLng(centre), geoLayer=L.geoJson(result,Options)).length<=0){
    console.log('not in layer');
    map.fitBounds(geoLayer.getBounds());
    geoLayer.addTo(map)
  }else{
    marker.setGeoJson(result);
  }
  marker.setLatLng(centre);

}

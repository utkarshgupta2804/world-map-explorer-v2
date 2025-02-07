/* 
 * Copyright (c) 2023-25 Zendalona
 * This software is licensed under the GPL-3.0 License.
 * See the LICENSE file in the root directory for more information.
  */
import { map } from '../map.js';
import { notifySreenReader } from '../../utils/accessibility.js';
import { bordercrossSound } from '../../utils/sounds.js';
import { isInindiaKashmir } from "../../services/nominatim.js";
import { osmIds } from '../../services/fetch-place.js';
import { IndiaFull, kasmir } from '../../services/fetch-india.js';
import { findborderpoints } from './border-distance.js';
import { geocodingAPI } from '../../utils/to-km-or-meter.js';

let controller = null; //for aborting fetch request
let errorCount = 0;
let oldName, presentName; // old name, present name for stating border crossing
let isMarkerStable = true; // for avoid repeated fetch
let wentFar = 0; //for counting how far went when fetching border
let Kashmir = kasmir; //for fetching kashmir border

export function checkBorderCrossed(distance) {
  if (this?._placeBorderofCurrentLocation) { //checking if border is present already
    if (
      leafletPip.pointInLayer(  //checking if the marker is inside the border
        this.getLatLng(),
        this._placeBorderofCurrentLocation
      ).length <= 0 &&
      isMarkerStable
    ) {
      isMarkerStable = false;
      bordercrossSound.play();
      oldName = presentName;

      getBorder //fetching border of the new location
        .bind(this)()
        .then((data) => {
          if (data.name != 'sea(mostly)') {
            checkBorderCrossed.bind(this)(0); // recalling the function to ensure the border is shown appropriately for the new location
          }
          if (distance <= 60 && data.name != oldName.name) { // checking the distance between the old and new location is less than 60 pixels, only then it is considered as border crossed
            if (crossedhigherlevel(oldName, presentName)) {

              //if crossed to higher level border(like district to another state district)
              notifySreenReader(
                `${oldName.display_name} crossed. ${data.display_name} entered`,
                true
              );
            } else {
              notifySreenReader(
                `${oldName.name} crossed. ${data.name} entered`,
                true
              );
            }
            if (wentFar >= 7) {
              notifySreenReader('May be went too far');
              wentFar = 0;
            }
          }
          // Code to execute after getBorder finishes (success)
        })
        .catch((error) => {
          console.error('Error in getBorder:', error);
        });
    } else {
      if (!isMarkerStable) {
        wentFar++;
      }
    }
  } else {
    getBorder.bind(this)();
  }
}

//function for fetching and adding polygon to map
export async function getBorder() {
  if (!this._placeBorderofSelectedLocation) this._borderPoints=null; //clearing previous border points
  return new Promise(async (resolve, reject) => {
    if (controller) { //aborting previous fetch request
      controller.abort(); 
    }
    controller = new AbortController();
    const signal = controller.signal;

    try {
      isMarkerStable = false;
      map.eachLayer((layer) => {
        if (layer instanceof L.GeoJSON && layer.getPane().classList.contains('leaflet-overlay-pane')) {
          map.removeLayer(layer); // Remove the marker
        }
      });
      const response = await fetch(
        `${geocodingAPI}/reverse?lat=${this.getLatLng().lat}&lon=${this.getLatLng().lng}&zoom=${getFixedZoom()}&format=geojson&polygon_geojson=1&polygon_threshold=${1 / Math.pow(map.getZoom(), 3)}`,
        {
          signal: signal, // The signal object for cancellation
          referrerPolicy: 'strict-origin-when-cross-origin', // The referrer policy
        }
      );
      let data = await response.json();

      // Extract presentName from the data
      presentName = data.features[0].properties;

      // Check if the name is "India" and fetch additional data if true to correct border
      if (data.features[0].properties.name === 'India') {
        data = IndiaFull;
      }
      if (await isInindiaKashmir(this,presentName)) {
        presentName = { name: 'India', display_name: 'India' };
        data = IndiaFull;
      }

      osmIds.forEach((value) => {
        if (value == presentName.osm_id) {
          data = turf.difference(data.features[0], Kashmir.features[0]);
        }
      });

      // if(this._placeBorderofSelectedLocation){ //because of multiple async calls this may be run even after selecting a place, so checking if there any selection present
      //   return resolve(presentName);
      // }
      if (!this._placeBorderofSelectedLocation) this._geoJson = data;
      if (!this._placeBorderofSelectedLocation) this._borderPoints = findborderpoints.bind(this)(data);

      this._placeBorderofCurrentLocation = L.geoJson(data, {
        fillOpacity: 0,
      });
      this._placeBorderofCurrentLocation.addTo(map);
      isMarkerStable = true;
      resolve(presentName);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.error(error);
        errorCount++;
        if (errorCount > 5) {
          notifySreenReader("You're going too fast");
          errorCount = 0;
        }
      } else if (error instanceof TypeError) {
        console.error(error);
        presentName = { name: 'sea(mostly)', display_name: 'sea(mostly)' };
      } else {
        console.error(error);
      }
      presentName = { name: 'sea(mostly)', display_name: 'sea(mostly)' };
      isMarkerStable = true;
      resolve(presentName);
    }
  });
}

function crossedhigherlevel(cro, ent) { //for checking if crossed to higher level or not, like palakkad to coimbatore
  if (ent.place_rank >= 10) {
    if (
      ent.address?.state !== cro.address?.state ||
      ent.address?.province !== cro.address?.province ||
      ent.address?.country !== cro.address?.country
    ) {
      return true;
    } else {
      return false;
    }
  } else if (ent.place_rank >= 8) {
    if (ent.address?.country !== cro.address?.country) {
      return true;
    } else {
      return false;
    }
  }
}

// for fixing district minimum view
function getFixedZoom() {
  if (map.getZoom() >= 8) {
      return 6
  } else if (map.getZoom() >= 5 && map.getZoom() <= 7) {
      return 5
  } else if (map.getZoom() <= 4) {
      return 2
  }
}


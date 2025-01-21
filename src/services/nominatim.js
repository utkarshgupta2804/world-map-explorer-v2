/* 
 * Copyright (c) 2023-25 Zendalona
 * This software is licensed under the GPL-3.0 License.
 * See the LICENSE file in the root directory for more information.
  */
import { geocodingAPI, headerofNominatim } from "../utils/to-km-or-meter.js";
import { kasmir } from "./fetch-india.js";
export const bbox = L.latLngBounds(
    L.latLng(31.579199916145, 71.366088444458),  // Southwest corner (minLat, minLon)
    L.latLng(37.596155337118,80.442480694206)   // Northeast corner (maxLat, maxLon)
  );



export async function isInindiaKashmir(marker,result){ //function to check if the marker is in disputed kashmir
    if(bbox.contains(marker.getLatLng())){
      const addressData = await fetch(`${geocodingAPI}/details?osmtype=${result.osm_type.trim().charAt(0).toUpperCase()}&osmid=${result.osm_id}&addressdetails=1&format=json`,headerofNominatim)
  .then(response => response.json());
      if((leafletPip.pointInLayer(marker.getLatLng(), L.geoJson(kasmir)).length > 0) && addressData.country_code!='in'){ //make no data for pak-kasmir
        return true
      }else{
        return false
      }
    }else{
      return false
    }
  }


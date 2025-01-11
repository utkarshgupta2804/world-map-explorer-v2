import { fetchKashmir } from "./fetch-india.js";
const bbox = L.latLngBounds(
    L.latLng(31.579199916145, 71.366088444458),  // Southwest corner (minLat, minLon)
    L.latLng(37.596155337118,80.442480694206)   // Northeast corner (maxLat, maxLon)
  );



export async function isInindiaKashmir(marker,result){ //function to check if the marker is in disputed kashmir
  console.log(marker,'isinindia');
    if(bbox.contains(marker.getLatLng())){
      const addressData = await fetch(`${geocodingAPI}/details.php?osmtype=${result.osm_type.trim().charAt(0).toUpperCase()}&osmid=${result.osm_id}&addressdetails=1&format=json`,{
  
        referrerPolicy: "strict-origin-when-cross-origin"
  
  })
  .then(response => response.json());
  
      if((leafletPip.pointInLayer(marker.getLatLng(), L.geoJson(await fetchKashmir())).length > 0) && addressData.country_code!='in'){ //make no data for pak-kasmir
        return true
      }else{
        return false
      }
    }else{
      return false
    }
  }

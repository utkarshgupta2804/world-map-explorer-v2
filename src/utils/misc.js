import { map } from "../components/map.js";

export function toKMorMeter(num){
    return(num < 1000
                            ? parseInt(num) + " meters"
                            : parseInt(num / 1000) + " Kilo meters")
}

export function calculateHeight() { //function to calculate the height of the view
    let num =
        ((40075016 * Math.cos((marker.getLatLng().lat * Math.PI) / 180)) /
            Math.pow(2, map.getZoom() + 8)) *
        1050;
    document.getElementById("camera-height").innerText = "View Height :" + toKMorMeter(num);
}

export const geocodingAPI = 'https://nominatim.openstreetmap.com';
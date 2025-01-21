/* 
 * Copyright (c) 2023-25 Zendalona
 * This software is licensed under the GPL-3.0 License.
 * See the LICENSE file in the root directory for more information.
  */
import { map } from "../components/map.js";
import { isInindiaKashmir } from "../services/nominatim.js";
import { notifySreenReader } from "../utils/accessibility.js";
import { geocodingAPI, headerofNominatim } from "../utils/to-km-or-meter.js";

export async function findplaceNamAandData(point) {
    if (point) {
        let name; //for storing place name
        let d //for storing data of place
            await fetch(
                `${geocodingAPI}/reverse?lat=${point.getLatLng().lat}&lon=${point.getLatLng().lng
                }&zoom=${map.getZoom()}&format=jsonv2`,
                headerofNominatim
            )
                .then((response) => response.json())
                .then(async (data) => {
                    d = data;
                    name = data.name;
                    if (data.error == "Unable to geocode") {
                        name = "Sea";
                    }
                    if (await isInindiaKashmir(this,data)) {
                        name = "India";
                    }
                })
                .catch((error) => {
                    console.error("Error in fetching place name:", error);
                });
        notifySreenReader(name, true);
        return {name:name,data:d};
    } else {
        alert("click somewhere first!");
    }
}

import { map } from "../components/map.js";
import { isInindiaKashmir } from "../services/nominatim.js";
import { notifySreenReader } from "../Util/accessibility.js";
import { geocodingAPI } from "../Util/misc.js";

export async function findplaceNamAandData(point) {
    if (point) {
        let name; //for storing place name
        let d //for storing data of place
            await fetch(
                `${geocodingAPI}/reverse.php?lat=${point.getLatLng().lat}&lon=${point.getLatLng().lng
                }&zoom=${map.getZoom()}&format=jsonv2`,
                {
                    referrerPolicy: "strict-origin-when-cross-origin",
                }
            )
                .then((response) => response.json())
                .then(async (data) => {
                    d = data;
                    name = data.name;
                    if (data.error == "Unable to geocode") {
                        name = "Sea";
                    }
                    if (await isInindiaKashmir(this,data)) {
                        console.log(data);
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
export function findborderpoints(place){   //function to find the all four border points of the given location, N E W S
    try {
        console.log(place,"from findborderpoints");
        var longitude = this.getLatLng().lng;
        var lineSN = turf.lineString([
            [longitude, 90], // Start point at the North Pole
            [longitude, -90], // End point at the South Pole
        ]);
        var intersections = turf.lineIntersect(lineSN, place);
        var val = intersections.features.map(
            (feature) => feature.geometry.coordinates[1]
        );
        var greaterNumbers = val.filter((num) => num > this.getLatLng().lat);
        var LesserNumbers = val.filter((num) => num < this.getLatLng().lat);
        const north = Math.min(...greaterNumbers);
        const south = Math.max(...LesserNumbers);

        const latitude = this.getLatLng().lat;
        const lineWE = turf.lineString([
            [-180, latitude], // Start point at the North Pole
            [180, latitude], // End point at the South Pole
        ]);
        intersections = turf.lineIntersect(lineWE, place);
        val = intersections.features.map(
            (feature) => feature.geometry.coordinates[0]
        );
        greaterNumbers = val.filter((num) => num > this.getLatLng().lng);
        LesserNumbers = val.filter((num) => num < this.getLatLng().lng);
        const east = Math.min(...greaterNumbers);
        const west = Math.max(...LesserNumbers);
        return {
            north: [north, longitude],
            south: [south, longitude],
            west: [latitude, west],
            east: [latitude, east],
        };
    } catch (error) {
        console.error("ippo enganirikkan" + error);
    }
}
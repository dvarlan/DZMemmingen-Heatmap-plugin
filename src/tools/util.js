export default class util {

    static calculateMeanValue() {
        // Objekt übergeben?
    }

    static covertLonLatToXY(lat, lon, boundingbox, canvasWidth, canvasHeight) {
        const minLat = boundingbox.south;
        const maxLat = boundingbox.north;
        const minLon = boundingbox.west;
        const maxLon = boundingbox.east;

        let normalizedLat = (lat - minLat) / (maxLat - minLat);
        let normalizedLon = (lon - minLon) / (maxLon - minLon);

        let x = Math.floor(normalizedLon * canvasWidth);
        let y = Math.floor((1 - normalizedLat) * canvasHeight);

        return {
            x: x,
            y: y
        };
    }
}
export default class util {

    static stationMappings = [
        { name: 'Schrannenplatz Messpunkt 1', lat: 47.982948, lon: 10.182558, x: 1181, y: 1044 }, // Schrannenplatz Osten
        { name: 'Schrannenplatz Messpunkt 2', lat: 47.982792, lon: 10.181391, x: 1101, y: 1066 }, // Schrannenplatz Westen
        { name: 'Schrannenplatz Messpunkt 3', lat: 47.98288, lon: 10.182168, x: 1154, y: 1054 }, // Schrannenplatz Mitte
        { name: 'Weinmarkt Messpunkt 1', lat: 47.984707, lon: 10.180835, x: 1062, y: 799 }, // Weinmarkt Mitte
        { name: 'Weinmarkt Messpunkt 2', lat: 47.984859, lon: 10.182212, x: 1157, y: 777 }, // Weinmarkt Westen
        { name: 'Weinmarkt Messpunkt 3', lat: 47.984721, lon: 10.181372, x: 1099, y: 797 } // Weinmarkt Osten
    ];

    // Für einen Buffer der größe 50
    static bufferedBoundingBox = {
        minX: 1012,
        maxX: 1231,
        minY: 727,
        maxY: 1116
    };

    static calculateMeanValueForStations(data) {
        let result = [];
        this.stationMappings.forEach(station => {
            let sum = 0;
            let amount = 0;
            data.forEach(dataPoint => {
                if (dataPoint.Lon === station.lon && dataPoint.Lat === station.lat) {
                    sum += dataPoint.Wert;
                    amount++;
                }
            });
            if (isNaN(Math.round(sum / amount))) {
                console.log("[DEBUG] Found NaN for: " + sum + " / " + amount);
            }
            result.push({
                x: station.x,
                y: station.y,
                value: Math.round(sum / amount)
            });
        });
        return result;
    }

    static iterpolateValues(stationValue, backgroundValue) {
        return Math.round((stationValue + backgroundValue) / 2);
    }

    static createBufferForPoint(point, bufferSize) {
        return {
            xMin: point.x - bufferSize,
            xMax: point.x + bufferSize,
            yMin: point.y - bufferSize,
            yMax: point.y + bufferSize,
            value: point.value
        };
    }

    static isPointInBuffer(point, buffer) {
        return (
            point.x >= buffer.xMin &&
            point.x <= buffer.xMax &&
            point.y >= buffer.yMin &&
            point.y <= buffer.yMax
        );
    }

    static isPointInBufferdBoundingBox(point) {
        return (
            point.x >= this.bufferedBoundingBox.minX &&
            point.x <= this.bufferedBoundingBox.maxX &&
            point.y >= this.bufferedBoundingBox.minY &&
            point.y <= this.bufferedBoundingBox.maxY
        );
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
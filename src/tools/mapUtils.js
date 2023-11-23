export default class util {

    // Für einen Buffer der größe 50
    static bufferedBoundingBox = {
        minX: 1012,
        maxX: 1231,
        minY: 727,
        maxY: 1116
    };

    static iterpolateValues(stationValue, backgroundValue) {
        return ((parseFloat(stationValue) + parseFloat(backgroundValue)) / 2).toFixed(1);
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
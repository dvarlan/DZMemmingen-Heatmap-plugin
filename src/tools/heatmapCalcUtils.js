export default class heatmapCalcUtils {

    static stationMappings = [
        { name: 'Schrannenplatz Messpunkt 1', lat: 47.982948, lon: 10.182558, x: 1181, y: 1044 }, // Schrannenplatz Osten
        { name: 'Schrannenplatz Messpunkt 2', lat: 47.982792, lon: 10.181391, x: 1101, y: 1066 }, // Schrannenplatz Westen
        { name: 'Schrannenplatz Messpunkt 3', lat: 47.98288, lon: 10.182168, x: 1154, y: 1054 }, // Schrannenplatz Mitte
        { name: 'Weinmarkt Messpunkt 1', lat: 47.984707, lon: 10.180835, x: 1062, y: 799 }, // Weinmarkt Mitte
        { name: 'Weinmarkt Messpunkt 2', lat: 47.984859, lon: 10.182212, x: 1157, y: 777 }, // Weinmarkt Westen
        { name: 'Weinmarkt Messpunkt 3', lat: 47.984721, lon: 10.181372, x: 1099, y: 797 } // Weinmarkt Osten
    ];

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
            if (!isNaN((sum / amount).toFixed(1))) {
                result.push({
                    x: station.x,
                    y: station.y,
                    value: (sum / amount).toFixed(1)
                });
            }
        });
        return result;
    }
}
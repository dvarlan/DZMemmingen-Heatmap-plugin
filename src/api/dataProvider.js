import heatmap from "./heatmapProvider";

let _instance = null;
const requestUrl = 'https://gis3dweb.riwagis.de/srv/buergerlink/memmingen_gd_test/map3d/vcm/datasource-data/sensorthings/Locations/?$filter=description%20eq%27Temperatur_Luftfeuchte%27%20and%20properties/tenantUID%20eq%20%2797609513-84AF-46BD-B6A6-76C071F1FBFB%27%20and%20properties/deletedFlag%20eq%20%27False%27&$resultFormat=GeoJSON'

export default class dataProvider {
    constructor() {
        this.pointData = [];
        this.heatmapData = [];
        this.minRandomValue = -15;
        this.maxRandomValue = 40;
    }

    static getInstance() {
        if (_instance) {
            return _instance;
        }
        _instance = new dataProvider();
        _instance.initialize();
        return _instance;
    }

    initialize() {
        console.log("[DEBUG] Dataprovider initialized!");
        this.initializePointData();
        this.initializeHeatmapData();
    }

    initializePointData() {
        fetch(requestUrl)
            .then(response => response.json())
            .then(json => {
                json.features.forEach((entry) => {
                    if (entry.properties['properties/activeFlag'] === 'True') {
                        this.pointData.push({
                            lat: entry.geometry.coordinates[1],
                            lon: entry.geometry.coordinates[0]
                        })
                    }
                })
            });
        console.log("[DEBUG] Point Data")
        console.log(this.pointData);
    }

    initializeHeatmapData() {
        fetch(requestUrl)
            .then(response => response.json())
            .then(json => {
                for (let time = 0; time < 24; time++) {
                    const timeData = {
                        time: time,
                        data: []
                    };

                    json.features.forEach(station => {
                        if (station.properties['properties/activeFlag'] === 'True') {

                            const heatmapInstance = heatmap.getInstance();
                            let convertedPoint = this.covertLonLatToXY(station.geometry.coordinates[1], station.geometry.coordinates[0], heatmapInstance.rawHeatmapBouningBox, heatmapInstance.canvasWidth, heatmapInstance.canvasHeight);

                            const stationData = {
                                x: convertedPoint[0],
                                y: convertedPoint[1],
                                value: this.getRandomTempValue()
                            };
                            timeData.data.push(stationData);
                        }
                    });

                    this.heatmapData.push(timeData);
                }
            });
        console.log("[DEBUG] Heatmap Data");
        console.log(this.heatmapData);
    }

    getPointsAsCesiumDataSource() {
        const dataSource = new Cesium.CustomDataSource('3D Station Points');

        this.pointData.forEach(point => {
            let entity = new Cesium.Entity({
                position: Cesium.Cartesian3.fromDegrees(point.lon, point.lat, 620), //TODO: Fetch height dynamically
                point: {
                    pixelSize: 10,
                    color: Cesium.Color.BLUE,
                    outlineColor: Cesium.Color.BLACK
                },
                value: point.value
            });
            dataSource.entities.add(entity);
        });
        return dataSource;
    }

    getRandomTempValue() {
        return Math.floor(Math.random() * (this.maxRandomValue - (this.minRandomValue)) + this.minRandomValue);
    }

    getMinTempValue() {
        return this.minRandomValue;
    }

    getMaxTempValue() {
        return this.maxRandomValue;
    }

    covertLonLatToXY(lat, lon, boundingbox, canvasWidth, canvasHeight) {
        const minLat = boundingbox.south;
        const maxLat = boundingbox.north;
        const minLon = boundingbox.west;
        const maxLon = boundingbox.east;

        let normalizedLat = (lat - minLat) / (maxLat - minLat);
        let normalizedLon = (lon - minLon) / (maxLon - minLon);

        let x = Math.floor(normalizedLon * canvasWidth);
        let y = Math.floor((1 - normalizedLat) * canvasHeight);

        return [x, y];
    }
}
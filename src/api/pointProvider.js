import heatmapCalcUtils from "../tools/heatmapCalcUtils";

const requestUrl = 'https://dz.memmingen.de/datasource-data/sensorthings/Locations/?$filter=description%20eq%27Temperatur_Luftfeuchte%27%20and%20properties/tenantUID%20eq%20%2797609513-84AF-46BD-B6A6-76C071F1FBFB%27%20and%20properties/deletedFlag%20eq%20%27False%27&$resultFormat=GeoJSON';
const framework = vcs.vcm.Framework.getInstance();

export default class pointProvider {

    constructor() {
        this.stationPositions = [];
        this.cesiumDataSource = null;
    }

    /**
     * Fetches the lat and lon position for all active Stations.
     */
    async fetchStationPoints() {
        const response = await fetch(requestUrl);
        const responseJson = await response.json();
        responseJson.features.forEach(entry => {
            if (entry.properties['properties/activeFlag'] === 'True') {
                this.stationPositions.push({
                    lat: entry.geometry.coordinates[1],
                    lon: entry.geometry.coordinates[0]
                });
            }
        });
    }

    /**
     * Fetches the lat and lon position for the 6 Stations from the JSON Dataset.
     */
    fetchStationPointsForDataset() {
        heatmapCalcUtils.stationMappings.forEach(station => {
            this.stationPositions.push({
                lat: station.lat,
                lon: station.lon
            });
        });
    }

    /**
     * Converts the stationPositions to cesiumDataSource.
     */
    convertPointsToCesiumDataSource() {
        this.cesiumDataSource = new Cesium.CustomDataSource('Station Points');

        this.stationPositions.forEach(point => {
            let entity = new Cesium.Entity({
                position: Cesium.Cartesian3.fromDegrees(point.lon, point.lat, 620),
                point: {
                    pixelSize: 10,
                    color: Cesium.Color.BLUE,
                    outlineColor: Cesium.Color.BLACK
                }
            });
            this.cesiumDataSource.entities.add(entity);
        });
    }

    drawStationPoints() {
        framework.getActiveMap().getDatasources().add(this.cesiumDataSource);
    }

    hideStationPoints() {
        framework.getActiveMap().getDatasources().remove(this.cesiumDataSource);
    }

    clear() {
        framework.getActiveMap().getDatasources().remove(this.cesiumDataSource, true);
    }
}
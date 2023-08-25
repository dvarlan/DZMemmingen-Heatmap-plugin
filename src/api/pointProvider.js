const requestUrl = 'https://gis3dweb.riwagis.de/srv/buergerlink/memmingen_gd_test/map3d/vcm/datasource-data/sensorthings/Locations/?$filter=description%20eq%27Temperatur_Luftfeuchte%27%20and%20properties/tenantUID%20eq%20%2797609513-84AF-46BD-B6A6-76C071F1FBFB%27%20and%20properties/deletedFlag%20eq%20%27False%27&$resultFormat=GeoJSON';
const framework = vcs.vcm.Framework.getInstance();

export default class pointProvider {

    constructor() {
        this.stationPositions = [];
    }

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

    getPointsAsCesiumDataSource() {
        const dataSource = new Cesium.CustomDataSource('Station Points');

        this.stationPositions.forEach(point => {
            let entity = new Cesium.Entity({
                position: Cesium.Cartesian3.fromDegrees(point.lon, point.lat, 620),
                point: {
                    pixelSize: 10,
                    color: Cesium.Color.BLUE,
                    outlineColor: Cesium.Color.BLACK
                }
            });
            dataSource.entities.add(entity);
        });
        return dataSource;
    }

    drawStationPoints(dataSource) {
        framework.getActiveMap().getDatasources().add(dataSource);
        console.log("[DEBUG] Station points added");
    }

    clear() {
        const map = framework.getActiveMap();
        const stationPoints = map.getDatasources().getByName('Station Points')[0];
        if (stationPoints) {
            map.getDatasources().remove(stationPoints);
        }
    }
}
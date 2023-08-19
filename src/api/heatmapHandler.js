import dateTools from "../tools/dateTools";
import h337 from "heatmap.js-fix";
import util from "../tools/util";

// TODO: Rename
export default class heatmapProvider {

    constructor() {
        this.canvasHeight = 1800;
        this.canvasWidth = 2400;
        this.rawHeatmapBouningBox = {
            west: 10.165426272431576,
            south: 47.97753412328743,
            east: 10.200222844460304,
            north: 47.990433576113986,
        };
        this.mode = '';
        this.data = [];
        this.heatmapData = [];
        this.heatmapConfig = {
            radius: 40,
            maxOpacity: 0.6,
            minOpacity: 0,
            blur: 0.85
        };
    }

    createHeatmapContainers() {
        let heatmapContainerWrapper = document.getElementById('heatmap-container-wrapper');
        this.data = vcs.ui.store.getters['heatmap/getSensorData'];
        this.mode = vcs.ui.store.getters['heatmap/getMode'];

        if (!heatmapContainerWrapper) {
            heatmapContainerWrapper = document.createElement('div');
            heatmapContainerWrapper.setAttribute('id', 'heatmap-container-wrapper');
            document.body.appendChild(heatmapContainerWrapper);
        }

        if (this.mode === 'day') {
            // Name: Timestamp + Uhrzeit -> '2023-01-01 00:00:00'
            for (let hour = 0; hour < 24; hour++) {
                const heatmapContainer = document.createElement("div");
                heatmapContainer.setAttribute('id', dateTools.createLableFromDateAndHour(this.data[0].timestamp, hour));
                heatmapContainer.setAttribute('style', `height: ${this.canvasHeight}px; width: ${this.canvasWidth}px; z-index: 1337; pointer-events: none; display: none;`);
                heatmapContainerWrapper.appendChild(heatmapContainer);
            }
        } else if (this.mode === 'default') {
            // Name: Timestamp -> '2023-01-01'
            for (let day = 0; day < this.data.length; day++) {
                const heatmapContainer = document.createElement("div");
                heatmapContainer.setAttribute('id', this.data[day].timestamp);
                heatmapContainer.setAttribute('style', `height: ${this.canvasHeight}px; width: ${this.canvasWidth}px; z-index: 1337; pointer-events: none; display: none;`);
                heatmapContainerWrapper.appendChild(heatmapContainer);
            }
        }
    }

    createHeatmapsForDays() {
        for (let hour = 0; hour < 24; hour++) {
            let heatmapCanvas = h337.create({
                container: document.getElementById(dateTools.createLableFromDateAndHour(this.data[0].timestamp, hour)),
                radius: this.heatmapConfig.radius,
                maxOpacity: this.heatmapConfig.maxOpacity,
                minOpacity: this.heatmapConfig.minOpacity,
                blur: this.heatmapConfig.blur
            });

            heatmapCanvas.setData({
                min: vcs.ui.store.getters['heatmap/getMinValue'] - 2, // Offsets added for better visualisation when testing
                max: vcs.ui.store.getters['heatmap/getMaxValue'] + 2, // Offsets added for better visualisation when testing
                data: this.convertDataForHeatmapDay(hour)
            });
        }
    }

    createHeatmapsForDefault() {
        // Hier auch bei dem 'default' mode den Mittelwert für den Tag berechnen (util.js Funktion)
    }

    addHeatmapBackgroundValueDay(currentHour) {
        // Überprüfen ob 2 Funktionen notwendig sind
        let backgroundValue = null;
        vcs.ui.store.getters['heatmap/getBackgroundData'].forEach(entry => {
            if (dateTools.getTimeForTimestamp(entry.timestamp, 'T') === dateTools.createHourLableFromNumber(currentHour)) {
                backgroundValue = entry.value;
            }
        });
        // TODO: Only basic implementation for now
        for (let i = 0; i < this.canvasWidth; i += 35) {
            for (let j = 0; j < this.canvasHeight; j += 35) {
                this.heatmapData.push({
                    x: i,
                    y: j,
                    value: backgroundValue
                });
            }
        }
    }

    addHeatmapBackgroundValueDefault() {

    }

    convertDataForHeatmapDay(currentHour) {
        this.heatmapData = [];
        this.data[0].data.forEach(entry => {
            if (entry.Uhrzeit === dateTools.createHourLableFromNumber(currentHour) && entry.data.length > 0) {
                entry.data.forEach(station => {
                    const convertedCoordinates = util.covertLonLatToXY(station.Lat, station.Lon, this.rawHeatmapBouningBox, this.canvasWidth, this.canvasHeight);
                    this.heatmapData.push({
                        x: convertedCoordinates.x,
                        y: convertedCoordinates.y,
                        value: station.Wert
                    });
                });
            }
        });
        if (vcs.ui.store.getters['heatmap/usingBackgroundValue']) {
            this.addHeatmapBackgroundValueDay(currentHour);
        }
        return this.heatmapData;
    }

    convertDataForHeatmapDefault() {

    }

    changeToNextHeatmap() {
        // Werden eh der Reihe nach im DOM angeordnet also kann auch einfach darüber iteriert werden
    }
}
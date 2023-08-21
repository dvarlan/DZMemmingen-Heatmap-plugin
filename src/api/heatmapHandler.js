import dateTools from "../tools/dateTools";
import h337 from "heatmap.js-fix";
import util from "../tools/util";

const framework = vcs.vcm.Framework.getInstance();

// TODO: Rename
export default class heatmapProvider {

    constructor() {
        this.canvasHeight = 1800;
        this.canvasWidth = 2400;
        this.rawHeatmapBoundingBox = {
            west: 10.165426272431576,
            south: 47.97753412328743,
            east: 10.200222844460304,
            north: 47.990433576113986,
        };
        this.mode = '';
        this.data = [];
        this.heatmapData = [];
        this.heatmapLayer = null;
        this.currentTimestampIndex = 0;
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
        for (let day = 0; day < this.data.length; day++) {
            let heatmapCanvas = h337.create({
                container: document.getElementById('heatmap-container-wrapper').children[day],
                radius: this.heatmapConfig.radius,
                maxOpacity: this.heatmapConfig.maxOpacity,
                minOpacity: this.heatmapConfig.minOpacity,
                blur: this.heatmapConfig.blur
            });

            heatmapCanvas.setData({
                min: vcs.ui.store.getters['heatmap/getMinValue'] - 2, // Offsets added for better visualisation when testing
                max: vcs.ui.store.getters['heatmap/getMaxValue'] + 2, // Offsets added for better visualisation when testing
                data: this.convertDataForHeatmapDefault(day)
            });
        }
    }

    addHeatmapBackgroundValueDay(currentHour) {
        // TODO: Überprüfen ob 2 Funktionen notwendig sind
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
                    value: Math.round(backgroundValue)
                });
            }
        }
    }

    addHeatmapBackgroundValueDefault(currentDayIndex) {
        const backgroundValue = vcs.ui.store.getters['heatmap/getBackgroundData'][currentDayIndex].value;
        // TODO: Only basic implementation for now
        for (let i = 0; i < this.canvasWidth; i += 35) {
            for (let j = 0; j < this.canvasHeight; j += 35) {
                this.heatmapData.push({
                    x: i,
                    y: j,
                    value: Math.round(backgroundValue)
                });
            }
        }
    }

    convertDataForHeatmapDay(currentHour) {
        this.heatmapData = [];
        this.data[0].data.forEach(entry => {
            if (entry.Uhrzeit === dateTools.createHourLableFromNumber(currentHour) && entry.data.length > 0) {
                entry.data.forEach(station => {
                    const convertedCoordinates = util.covertLonLatToXY(station.Lat, station.Lon, this.rawHeatmapBoundingBox, this.canvasWidth, this.canvasHeight);
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

    convertDataForHeatmapDefault(currentDayIndex) {
        this.heatmapData = [];
        let currentEntryData = [];
        this.data[currentDayIndex].data.forEach(entry => {
            if (entry.data.length > 0) {
                entry.data.forEach(item => currentEntryData.push(item));
            }
        });
        this.heatmapData.push(...util.calculateMeanValueForStations(currentEntryData));
        if (vcs.ui.store.getters['heatmap/usingBackgroundValue']) {
            this.addHeatmapBackgroundValueDefault(currentDayIndex);
        }
        return this.heatmapData;
    }

    changeToNextHeatmap() {
        const map = framework.getActiveMap();
        map.getScene().imageryLayers.remove(this.heatmapLayer);
        const currentLabel = document.getElementById('heatmap-container-wrapper').children[this.currentTimestampIndex].getAttribute('id');
        vcs.ui.store.commit('heatmap/setCurrentLabel', currentLabel);
        const currentCanvas = document.getElementById('heatmap-container-wrapper').children[this.currentTimestampIndex].children[0];

        this.heatmapLayer = new Cesium.ImageryLayer(
            new Cesium.SingleTileImageryProvider({
                url: currentCanvas.toDataURL(),
                rectangle: Cesium.Rectangle.fromDegrees(
                    this.rawHeatmapBoundingBox.west,
                    this.rawHeatmapBoundingBox.south,
                    this.rawHeatmapBoundingBox.east,
                    this.rawHeatmapBoundingBox.north
                )
            })
        );
        map.getScene().imageryLayers.add(this.heatmapLayer);
        if (this.currentTimestampIndex === document.getElementById('heatmap-container-wrapper').children.length - 1) {
            this.currentTimestampIndex = 0;
        } else {
            this.currentTimestampIndex++;
        }
    }
}
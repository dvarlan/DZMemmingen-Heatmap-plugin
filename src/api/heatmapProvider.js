import dateUtils from "../tools/dateUtils";
import h337 from "heatmap.js-fix";
import mapUtils from "../tools/mapUtils";
import heatmapCalcUtils from "../tools/heatmapCalcUtils";

const framework = vcs.vcm.Framework.getInstance();

export default class heatmapProvider {

    constructor() {
        // Hardcoded here can be provided by a config object in the future

        this.canvasHeight = 1800; // Fixed value matching most screen sizes, further step: automatically detect best value for each screen
        this.canvasWidth = 2400; // Fixed value matching most screen sizes, further step: automatically detect best value for each screen
        this.rawHeatmapBoundingBox = { // Geographical area for the heatmap, in this case Memmingen, further step: detect area by data and add offset
            west: 10.165426272431576,
            south: 47.97753412328743,
            east: 10.200222844460304,
            north: 47.990433576113986,
        };
        this.mode = ''; // Possible values: "hours", "days"
        this.sensorData = []; // Raw Sensordata from JSON file, further step: provided by REST API
        this.heatmapLayer = null;
        this.backgroundBufferSize = 100; // Buffersize in px around the sensor points where the background value gets interpolatet with the sensor value
        this.backgroundDensity = 47; // Distance between background value points in px provided to heatmap.js
        this.backgroundHeightOffset = 550; // Inner offset for the background value, further step: detect from data
        this.backgroundWidthOffset = 900; // Inner offset for the background value, further step: detect from data
        this.currentTimestampIndex = 0; // Index for switching through heatamps, starts at first heatmap
        this.heatmapConfig = { // Heatmap.js config object see: https://www.patrick-wied.at/static/heatmapjs/docs.html#h337-create
            radius: 70,
            maxOpacity: 0.6,
            minOpacity: 0,
            blur: 0.85
        };
    }

    /**
     * Creates the div elements for the heatmap canvas elements with naming convention to be
     * referenced when switching the heatmaps. 
     */
    createHeatmapContainers_() {
        this.clear();

        let heatmapContainerWrapper = document.getElementById('heatmap-container-wrapper');
        this.sensorData = vcs.ui.store.getters['heatmap/getSensorData'];
        this.mode = vcs.ui.store.getters['heatmap/getMode'];

        if (!heatmapContainerWrapper) {
            heatmapContainerWrapper = document.createElement('div');
            heatmapContainerWrapper.setAttribute('id', 'heatmap-container-wrapper');
            document.body.appendChild(heatmapContainerWrapper);
        }

        if (this.mode === 'hours') {
            // Name: Timestamp -> '2023-01-01 00:00:00'
            for (let hour = 0; hour < 24; hour++) {
                const heatmapContainer = document.createElement("div");
                heatmapContainer.setAttribute('id', dateUtils.createLableFromDateAndHour(this.sensorData[0].timestamp, hour));
                heatmapContainer.setAttribute('style', `height: ${this.canvasHeight}px; width: ${this.canvasWidth}px; z-index: 1337; pointer-events: none; display: none;`);
                heatmapContainerWrapper.appendChild(heatmapContainer);
            }
        } else if (this.mode === 'days') {
            // Name: Date -> '2023-01-01'
            for (const day of this.sensorData) {
                const heatmapContainer = document.createElement("div");
                heatmapContainer.setAttribute('id', day.timestamp);
                heatmapContainer.setAttribute('style', `height: ${this.canvasHeight}px; width: ${this.canvasWidth}px; z-index: 1337; pointer-events: none; display: none;`);
                heatmapContainerWrapper.appendChild(heatmapContainer);
            }
        }
    }

    /**
     * Uses heatmap.js to create the heatmap canvases.
     */
    createHeatmapsForHours() {
        this.createHeatmapContainers_();
        for (let hour = 0; hour < 24; hour++) {
            let heatmapCanvas = h337.create({
                container: document.getElementById(dateUtils.createLableFromDateAndHour(this.sensorData[0].timestamp, hour)),
                radius: this.heatmapConfig.radius,
                maxOpacity: this.heatmapConfig.maxOpacity,
                minOpacity: this.heatmapConfig.minOpacity,
                blur: this.heatmapConfig.blur
            });

            heatmapCanvas.setData({
                min: vcs.ui.store.getters['heatmap/getMinValue'],
                max: vcs.ui.store.getters['heatmap/getMaxValue'],
                data: this.convertDataForHeatmapHour_(hour)
            });
        }
    }

    /**
     * Uses heatmap.js to create the heatmap canvases.
     */
    createHeatmapsForDays() {
        this.createHeatmapContainers_();
        for (let day = 0; day < this.sensorData.length; day++) {
            let heatmapCanvas = h337.create({
                container: document.getElementById('heatmap-container-wrapper').children[day],
                radius: this.heatmapConfig.radius,
                maxOpacity: this.heatmapConfig.maxOpacity,
                minOpacity: this.heatmapConfig.minOpacity,
                blur: this.heatmapConfig.blur
            });

            heatmapCanvas.setData({
                min: vcs.ui.store.getters['heatmap/getMinValue'],
                max: vcs.ui.store.getters['heatmap/getMaxValue'],
                data: this.convertDataForHeatmapDay_(day)
            });
        }
    }

    /**
     * Adds the background value to the heatmap. Interpolates the background values if they are in backgroundBufferSize around the sensors.
     * @param {number} currentHour 
     * @param {array} heatmapData 
     * @returns {array} heatmapData
     */
    addHeatmapBackgroundValueHour_(currentHour, heatmapData) {
        let backgroundValue = null;
        let stationBuffers = heatmapData.map(station => mapUtils.createBufferForPoint(station, this.backgroundBufferSize));
        vcs.ui.store.getters['heatmap/getBackgroundData'].forEach(entry => {
            if (dateUtils.getTimeForTimestamp(entry.timestamp, 'T') === dateUtils.createHourLableFromNumber(currentHour)) {
                backgroundValue = entry.value;
            }
        });

        for (let i = this.backgroundWidthOffset; i < this.canvasWidth - this.backgroundWidthOffset; i += this.backgroundDensity) {
            for (let j = this.backgroundHeightOffset; j < this.canvasHeight - this.backgroundHeightOffset; j += this.backgroundDensity) {
                let point = {
                    x: i,
                    y: j,
                    value: parseFloat(backgroundValue).toFixed(1)
                };
                // Only perform the check for points inside of a buffered BoundingBox around the sensors
                if (mapUtils.isPointInBufferdBoundingBox(point)) {
                    for (const buffer of stationBuffers) {
                        if (mapUtils.isPointInBuffer(point, buffer)) {
                            point.value = mapUtils.iterpolateValues(point.value, buffer.value);
                        }
                    }
                }
                heatmapData.push(point);
            }
        }
        return heatmapData;
    }

    /**
     * Adds the background value to the heatmap. Interpolates the background values if they are in backgroundBufferSize around the sensors.
     * @param {number} currentDayIndex 
     * @param {array} heatmapData 
     * @returns {array} heatmapData
     */
    addHeatmapBackgroundValueDay_(currentDayIndex, heatmapData) {
        const backgroundValue = vcs.ui.store.getters['heatmap/getBackgroundData'][currentDayIndex].value;
        let stationBuffers = heatmapData.map(station => mapUtils.createBufferForPoint(station, this.backgroundBufferSize));

        for (let i = this.backgroundWidthOffset; i < this.canvasWidth - this.backgroundWidthOffset; i += this.backgroundDensity) {
            for (let j = this.backgroundHeightOffset; j < this.canvasHeight - this.backgroundHeightOffset; j += this.backgroundDensity) {
                let point = {
                    x: i,
                    y: j,
                    value: parseFloat(backgroundValue).toFixed(1)
                };
                // Only perform the check for points inside of a buffered BoundingBox around the stations
                if (mapUtils.isPointInBufferdBoundingBox(point)) {
                    for (const buffer of stationBuffers) {
                        if (mapUtils.isPointInBuffer(point, buffer)) {
                            point.value = mapUtils.iterpolateValues(point.value, buffer.value);
                        }
                    }
                }
                heatmapData.push(point);
            }
        }
        return heatmapData;
    }

    /**
     * Creates heatmap data for heatmap.js using the raw sensor data.
     * @param {number} currentHour 
     * @returns {array} heatmapData
     */
    convertDataForHeatmapHour_(currentHour) {
        const heatmapData = [];
        this.sensorData[0].data.forEach(entry => {
            if (entry.Uhrzeit === dateUtils.createHourLableFromNumber(currentHour) && entry.data.length > 0) {
                entry.data.forEach(station => {
                    const convertedCoordinates = mapUtils.covertLonLatToXY(station.Lat, station.Lon, this.rawHeatmapBoundingBox, this.canvasWidth, this.canvasHeight);
                    heatmapData.push({
                        x: convertedCoordinates.x,
                        y: convertedCoordinates.y,
                        value: station.Wert
                    });
                });
            }
        });
        if (vcs.ui.store.getters['heatmap/usingBackgroundValue']) {
            this.addHeatmapBackgroundValueHour_(currentHour, heatmapData);
        }
        return heatmapData;
    }

    /**
     * Creates heatmap data for heatmap.js using the raw sensor data.
     * @param {number} currentDayIndex 
     * @returns {array} heatmapData
     */
    convertDataForHeatmapDay_(currentDayIndex) {
        const heatmapData = [];
        let currentEntryData = [];
        this.sensorData[currentDayIndex].data.forEach(entry => {
            if (entry.data.length > 0) {
                entry.data.forEach(item => currentEntryData.push(item));
            }
        });
        heatmapData.push(...heatmapCalcUtils.calculateMeanValueForStations(currentEntryData));
        if (vcs.ui.store.getters['heatmap/usingBackgroundValue']) {
            this.addHeatmapBackgroundValueDay_(currentDayIndex, heatmapData);
        }
        return heatmapData;
    }

    /**
     * Changes the visible heatmap in the map to the specified by currentTimestampIndex.
     */
    updateCurrentHeatmap() {
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

    /**
     * Removes the heatmap from the map, clears the DOM and resets currentTimestampIndex to 0.
     */
    clear() {
        let heatmapContainer = document.getElementById("heatmap-container-wrapper");
        if (heatmapContainer) {
            heatmapContainer.remove();
        }
        framework.getActiveMap().getScene().imageryLayers.remove(this.heatmapLayer);
        this.currentTimestampIndex = 0;
    }
}
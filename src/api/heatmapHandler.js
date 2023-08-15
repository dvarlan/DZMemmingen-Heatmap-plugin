import dateTools from "../tools/dateTools";
import h337 from "heatmap.js-fix";
import dataService from "./dataService";

// TODO: Rename
export default class heatmapProvider {

    constructor() {
        this.canvasHeight = 1800;
        this.canvasWidth = 2400;
        this.mode = '';
        this.data = [];
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

    createHeatmapsForContainers() {
        // Hier auch bei dem 'default' mode den Mittelwert für den Tag berechnen (andere Funktion)
        // In mehrere Funktionen aufteilen
        if (this.mode === 'day') {
            for (let hour = 0; hour < 24; hour++) {
                let heatmapCanvas = h337.create({
                    container: document.getElementById(dateTools.createLableFromDateAndHour(this.data[0].timestamp, hour)),
                    radius: this.heatmapConfig.radius,
                    maxOpacity: this.heatmapConfig.maxOpacity,
                    minOpacity: this.heatmapConfig.minOpacity,
                    blur: this.heatmapConfig.blur
                });
                // TODO: Check if background value is enabled
                heatmapCanvas.setData({
                    min: vcs.ui.store.getters['heatmap/getMinValue'],
                    max: vcs.ui.store.getters['heatmap/getMaxValue'],
                    data: dataInstance.heatmapData[time].data //TODO: Convert data in format for heatmap.js
                });
            }
        } else if (this.mode === 'default') {

        }
    }

    changeToNextHeatmap() {
        // Werden eh der Reihe nach im DOM angeordnet also kann auch einfach darüber iteriert werden
    }
}
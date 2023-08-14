import dateTools from "../tools/dateTools";

// TODO: Rename
export default class heatmapProvider {

    constructor() {
        this.canvasHeight = 1800;
        this.canvasWidth = 2400;
    }

    createHeatmapContainers() {
        let heatmapContainerWrapper = document.getElementById('heatmap-container-wrapper');
        let mode = vcs.ui.store.getters['heatmap/getMode'];
        let data = vcs.ui.store.getters['heatmap/getSensorData'];

        if (!heatmapContainerWrapper) {
            heatmapContainerWrapper = document.createElement('div');
            heatmapContainerWrapper.setAttribute('id', 'heatmap-container-wrapper');
            document.body.appendChild(heatmapContainerWrapper);
        }

        if (mode === 'day') {
            // Name: Timestamp + Uhrzeit -> '2023-01-01 00:00:00'
            for (let hour = 0; hour < 24; hour++) {
                const heatmapContainer = document.createElement("div");
                heatmapContainer.setAttribute('id', dateTools.createLableFromDateAndHour(data[0].timestamp, hour));
                heatmapContainer.setAttribute('style', `height: ${this.canvasHeight}px; width: ${this.canvasWidth}px; z-index: 1337; pointer-events: none; display: none;`);
                heatmapContainerWrapper.appendChild(heatmapContainer);
            }
        } else if (mode === 'default') {
            // Name: Timestamp -> '2023-01-01'
            for (let day = 0; day < data.length; day++) {
                const heatmapContainer = document.createElement("div");
                heatmapContainer.setAttribute('id', data[day].timestamp);
                heatmapContainer.setAttribute('style', `height: ${this.canvasHeight}px; width: ${this.canvasWidth}px; z-index: 1337; pointer-events: none; display: none;`);
                heatmapContainerWrapper.appendChild(heatmapContainer);
            }
        }
    }

    createHeatmapsForContainers() {
        // Hier auch bei dem 'default' mode den Mittelwert für den Tag berechnen (andere Funktion)
    }

    changeToNextHeatmap() {
        // Werden eh der Reihe nach im DOM angeordnet also kann auch einfach darüber iteriert werden
    }
}
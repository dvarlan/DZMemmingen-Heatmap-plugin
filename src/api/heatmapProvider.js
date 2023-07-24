import dataProvider from "./dataProvider";
import h337 from "heatmap.js-fix";

const dataInstance = dataProvider.getInstance();
const framework = vcs.vcm.Framework.getInstance();
let map = null;
let _instance = null;

export default class heatmap {
    constructor() {

        map = framework.getActiveMap();

        this.rawHeatmapBouningBox = {
            west: 10.165426272431576,
            south: 47.97753412328743,
            east: 10.200222844460304,
            north: 47.990433576113986,
        };

        this.heatmapBoundingBox = Cesium.Rectangle.fromDegrees(
            this.rawHeatmapBouningBox.west,
            this.rawHeatmapBouningBox.south,
            this.rawHeatmapBouningBox.east,
            this.rawHeatmapBouningBox.north
        );

        this.heatmapLayer = null;
        this.heatmapConfig = {
            radius: 40,
            maxOpacity: 0.6,
            minOpacity: 0,
            blur: 0.85
        };

        this.currentTime = 0;

        this.canvasHeight = 600 * 3;
        this.canvasWidth = 800 * 3;
    }

    static getInstance() {
        if (_instance) {
            return _instance;
        }
        _instance = new heatmap();
        return _instance;
    }

    createHeatmapContainers() {
        const heatmapContainerWrapper = document.createElement("div");
        heatmapContainerWrapper.setAttribute("id", "heatmap_container_wrapper");
        document.body.appendChild(heatmapContainerWrapper);

        for (let time = 0; time < 24; time++) {
            const heatmapContainer = document.createElement("div");
            heatmapContainer.setAttribute("id", `heatmapContainer_${time}`);
            heatmapContainer.setAttribute("style", `height: ${this.canvasHeight}px; width: ${this.canvasWidth}px; z-index: 1337; pointer-events: none; display: none;`);
            heatmapContainerWrapper.appendChild(heatmapContainer);
        }
    }

    createHeatmapCanvasForContainers() {
        for (let time = 0; time < 24; time++) {
            let heatmapCanvas = h337.create({
                container: document.getElementById(`heatmapContainer_${time}`),
                radius: this.heatmapConfig.radius,
                maxOpacity: this.heatmapConfig.maxOpacity,
                minOpacity: this.heatmapConfig.minOpacity,
                blur: this.heatmapConfig.blur
            });

            heatmapCanvas.setData({
                min: dataInstance.getMinTempValue(),
                max: dataInstance.getMaxTempValue(),
                data: dataInstance.heatmapData[time].data
            });
        }
    }

    changeToNextHeatmapCanvas() {
        console.log("Current time: " + this.currentTime);

        if (this.currentTime === 24) {
            this.currentTime = 0;
        }

        map.getScene().imageryLayers.remove(this.heatmapLayer);

        let currentContainer = document.getElementById(`heatmapContainer_${this.currentTime}`);
        let currentCanvas = currentContainer.querySelector('canvas[class="heatmap-canvas"]');

        this.heatmapLayer = new Cesium.ImageryLayer(
            new Cesium.SingleTileImageryProvider({
                url: currentCanvas.toDataURL(),
                rectangle: this.heatmapBoundingBox
            })
        );

        map.getScene().imageryLayers.add(this.heatmapLayer);
        this.currentTime++;
    }

    drawStationPoints3D() {
        const dataSource = dataInstance.getPointsAsCesiumDataSource();
        map.getDatasources().add(dataSource);
        console.log("[DEBUG] 3D stations added!");
    }

    clearLayers() {
        console.log("[DEBUG] Clearing layers...")
        let stationPoints = map.getDatasources().getByName("3D Station Points")[0];
        if (stationPoints !== []) {
            map.getDatasources().remove(stationPoints);
        }
        map.getScene().imageryLayers.remove(this.heatmapLayer);
        document.getElementById("heatmap_container_wrapper").remove();
        this.currentTime = 0;
    }
}
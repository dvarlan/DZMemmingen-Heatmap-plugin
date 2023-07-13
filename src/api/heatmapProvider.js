import dataProvider from "./dataProvider";
import h337 from "heatmap.js-fix";

const dataInstance = dataProvider.getInstance();
const framework = vcs.vcm.Framework.getInstance();
let map = null;
let _instance = null;

export default class heatmap {
    constructor() {

        /* The cesium map where everything is added */
        map = framework.getActiveMap();

        /* Boundingbox for 3D Heatmap */
        this.rawHeatmapBouningBox = {
            west: 10.165426272431576,
            south: 47.97753412328743,
            east: 10.200222844460304,
            north: 47.990433576113986,
        };

        this.heatmap3DBoundingBox = Cesium.Rectangle.fromDegrees(
            this.rawHeatmapBouningBox.west,
            this.rawHeatmapBouningBox.south,
            this.rawHeatmapBouningBox.east,
            this.rawHeatmapBouningBox.north
        );

        /* Internal 3D Heatmap using custom HeatmapJS */
        this.heatmapInstance = null;
        this.heatmapData = null;
        this.heatmapLayer = null;
        this.heatmapConfig = {
            radius: 40,
            opacity: .6,
            maxOpacity: null,
            minOpacity: null,
            blur: 0.85
        };

        this.canvasHeight = 600 * 3; // This will change how big the heatmap points are
        this.canvasWidth = 800 * 3; // This will change how big the heatmap points are
        this.heatmapRadius = 40; // This also allows manipulation of the radius regardless of canvas size
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
            heatmapContainer.setAttribute("style", `height: ${this.canvasHeight}px; width: ${this.canvasWidth}px; z-index: 1337; pointer-events: none;`);
            heatmapContainerWrapper.appendChild(heatmapContainer);
        }
    }

    createHeatmapCanvasForContainers() {
        for (let time = 0; time < 24; time++) {
            let heatmapCanvas = h337.create({
                container: document.getElementById(`heatmapContainer_${time}`),
                radius: this.heatmapConfig.radius
            });

            heatmapCanvas.setData({
                min: dataInstance.getMinTempValue(),
                max: dataInstance.getMaxTempValue(),
                data: dataInstance.heatmapData[time].data
            });
            console.log("---")
            console.log(dataInstance.getMinTempValue());
            console.log(dataInstance.getMaxTempValue());
            console.log(dataInstance.heatmapData[time].data);
        }
    }
    
    createHeatmapCanvas() {
        this.heatmapInstance = h337.create({
            container: document.getElementById("heatmapContainer_0"),
            radius: this.heatmapConfig.radius
        });

        // Some default values
        this.heatmapData = [{ x: 0, y: 0, value: 10 }, { x: 50, y: 50, value: 10 }, { x: 100, y: 100, value: 10 }, { x: 0, y: 500, value: 10 }];

        this.heatmapInstance.setData({
            min: 0,
            max: 10,
            data: this.heatmapData
        })
    }

    changeHeatmapCanvas() {
        this.heatmapInstance.setData(dataInstance.getDataForInternalHeatmap());

        // Currently has to be done like this, see https://github.com/CesiumGS/cesium/issues/5080
        map.getScene().imageryLayers.remove(this.heatmapLayer);

        this.heatmapLayer = new Cesium.ImageryLayer(
            new Cesium.SingleTileImageryProvider({
                url: (document.getElementsByClassName("heatmap-canvas")[0]).toDataURL(),
                rectangle: this.heatmap3DBoundingBox
            })
        );
        map.getScene().imageryLayers.add(this.heatmapLayer);

    }

    drawStationPoints3D() {
        const dataSource = dataInstance.getPointsAsCesiumDataSource();
        map.getDatasources().add(dataSource);
        console.log("[DEBUG] 3D stations added!");
    }
}
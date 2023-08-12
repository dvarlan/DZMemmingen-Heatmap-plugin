import dateTools from "../tools/dateTools";

const SENSOR_DATA_FILE_PATH = "./src/data/SensorData.json";
const DWD_DAILY_FILE_PATH = "./src/data/DWD_daily_mean.json";
const DWD_HOURLY_FILE_PATH = "./src/data/DWD_hourly.json";

export default class dataService {

    constructor() {
        this.sensorData = [];
        this.sensorDataForTimeframe = [];
        this.backgroundData = [];
        this.backgroundDataForTimeframe = [];
        this.mode = this.getMode();
        this.backgroundDataFilePath = "";

        this.getMode();
    }

    getMode() {
        const numberOfDays = dateTools.getInclusiveDaysBetweenDates(vcs.ui.store.getters['heatmap/getStartDate'], vcs.ui.store.getters['heatmap/getEndDate']);
        if (numberOfDays === 1) {
            // 24 Heatmaps (1 per hour)
            this.backgroundDataFilePath = DWD_HOURLY_FILE_PATH;
            return 'day';
        } else if (numberOfDays % 365 === 0) {
            // 12 Heatmaps (1 per month) | Not possible with current dataset
            return 'year';
        } else {
            // 1 Heatmap per day
            this.backgroundDataFilePath = DWD_DAILY_FILE_PATH;
            return 'default';
        }
    }

    async parseData() {
        if (vcs.ui.store.getters['heatmap/usingBackgroundValue']) {
            const backgroundResponse = await fetch(this.backgroundDataFilePath);
            const backgroundJson = backgroundResponse.json();
            backgroundJson.data.forEach(entry => {
                this.backgroundData.push({
                    timestamp: entry.Zeitstempel,
                    value: entry.Wert,
                    label: dateTools.getLabelForTimestamp(entry.Zeitstempel)
                });
            });
            console.log("[DEBUG] Raw background data: ")
            console.log(this.backgroundData);
        }

        const sensorResponse = await fetch(SENSOR_DATA_FILE_PATH);
        const sensorJson = await sensorResponse.json();
        sensorJson.forEach(entry => {
            this.sensorData.push({
                timestamp: entry.Zeitstempel,
                data: entry.data
            });
        });
        console.log("[DEBUG] Raw station data: ");
        console.log(this.sensorData);
    }

    getSensorDataForTimeframe() {
        if (this.mode === 'day') {
            this.sensorData.forEach(entry => {
                if (entry.timestamp.includes(vcs.ui.store.getters['heatmap/getStartDate'])) {
                    this.sensorDataForTimeframe.push(entry);
                }
            });
            console.log("[DEBUG] Station data for timeframe (day): ");
            console.log(this.sensorDataForTimeframe);
        } else if (this.mode === 'default') {
            this.sensorData.forEach(entry => {
                const currentDate = new Date(entry.timestamp);
                if (currentDate >= new Date(vcs.ui.store.getters['heatmap/getStartDate']) && currentDate <= new Date(vcs.ui.store.getters['heatmap/getEndDate'])) {
                    this.sensorDataForTimeframe.push(entry);
                }
            });
            console.log("[DEBUG] Station data for timeframe (default): ");
            console.log(this.sensorDataForTimeframe);
        }
    }

    getBackgroundDataForTimeframe() {

    }
}
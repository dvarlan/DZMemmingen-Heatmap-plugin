import dateTools from "../tools/dateTools";

const SENSOR_DATA_FILE_PATH = "./src/data/Sensor_2023-08-03.json";
const DWD_DAILY_FILE_PATH = "./src/data/DWD_daily_mean.json";
const DWD_HOURLY_FILE_PATH = "./src/data/DWD_hourly.json";

export default class dataService {

    constructor() {
        this.sensorData = [];
        this.backgroundData = [];
        this.dataLables = [];
        this.mode = this.getMode();
        this.backgroundDataFilePath = "";

        this.getMode();
    }

    getMode() {
        const numberOfDays = dateTools.getInclusiveDaysBetweenDates(vcs.ui.store.getters['heatmap/getStartDate'], vcs.ui.store.getters['heatmap/getEndDate']);
        if(numberOfDays === 1) {
            // 24 Heatmaps (1 per hour)
            this.backgroundDataFilePath = DWD_HOURLY_FILE_PATH;
            return 'day';
        } else if(numberOfDays % 365 === 0) {
            // 12 Heatmaps (1 per month) | Not possible with current dataset
            return 'year';
        } else {
            // 1 Heatmap per day
            this.backgroundDataFilePath = DWD_DAILY_FILE_PATH;
            return 'default';
        }
    }
    
    parseData() {
        if (vcs.ui.store.getters['heatmap/usingBackgroundValue']) {
            fetch(this.backgroundDataFilePath)
            .then(response => response.json())
            .then(json => {
                json.data.forEach(entry => {
                    this.backgroundData.push({
                        timestamp: entry.Zeitstempel,
                        value: entry.Wert,
                        label: dateTools.getLabelForTimestamp(entry.Zeitstempel)
                    });
                });
                console.log("[DEBUG] Raw background data: ")
                console.log(this.backgroundData);
            });
        }

        fetch(SENSOR_DATA_FILE_PATH)
        .then(response => response.json())
        .then(json => {
            json.data.forEach(entry => {
                this.sensorData.push({
                    timestamp: entry.Zeitstempel,
                    value: entry.Wert,
                    label: dateTools.getLabelForTimestamp(entry.Zeitstempel)
                });
            });
            console.log("[DEBUG] Raw station data: ")
            console.log(this.sensorData);
        });

    }

    getSensorDataForTimeframe() {

    }

    getBackgroundDataForTimeframe() {

    }
}
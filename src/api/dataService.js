import dateTools from "../tools/dateTools";
import util from "../tools/util";

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
        vcs.ui.store.commit('heatmap/setMode', this.mode);
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
            const backgroundJson = await backgroundResponse.json();
            backgroundJson.data.forEach(entry => {
                this.backgroundData.push({
                    timestamp: entry.Zeitstempel,
                    value: entry.Wert
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
        } else if (this.mode === 'default') {
            this.sensorData.forEach(entry => {
                const currentDate = new Date(entry.timestamp);
                if (currentDate >= new Date(vcs.ui.store.getters['heatmap/getStartDate']) && currentDate <= new Date(vcs.ui.store.getters['heatmap/getEndDate'])) {
                    this.sensorDataForTimeframe.push(entry);
                }
            });
            console.log("[DEBUG] Station data for timeframe (default): ");
        }
        vcs.ui.store.commit('heatmap/setSensorData', Object.freeze(this.sensorDataForTimeframe));
        console.log(vcs.ui.store.getters['heatmap/getSensorData']);
    }

    getBackgroundDataForTimeframe() {
        if (this.mode === 'day') {
            this.backgroundData.forEach(entry => {
                if (entry.timestamp.includes(vcs.ui.store.getters['heatmap/getStartDate'])) {
                    this.backgroundDataForTimeframe.push(entry);
                }
            });
            console.log("[DEBUG] Background data for timeframe (day): ")
        } else if (this.mode === 'default') {
            this.backgroundData.forEach(entry => {
                const currentDate = new Date(entry.timestamp);
                if (currentDate >= new Date(vcs.ui.store.getters['heatmap/getStartDate']) && currentDate <= new Date(vcs.ui.store.getters['heatmap/getEndDate'])) {
                    this.backgroundDataForTimeframe.push(entry);
                }
            });
            console.log("[DEBUG] Background data for timeframe (default): ")
        }
        vcs.ui.store.commit('heatmap/setBackgroundData', Object.freeze(this.backgroundDataForTimeframe));
        console.log(vcs.ui.store.getters['heatmap/getBackgroundData']);
    }

    getMinValueForTimeframeDay() {
        let result = Infinity;
        for (const entry of this.sensorDataForTimeframe[0].data) {
            if (entry.data.length > 0) {
                const minEntryValue = Math.min(...entry.data.map(item => item.Wert));
                result = Math.min(result, minEntryValue);
            }
        }
        if (this.backgroundDataForTimeframe.length > 0) {
            for (const entry of this.backgroundDataForTimeframe) {
                const currentValue = parseInt(entry.value);
                if (currentValue < result) {
                    result = currentValue;
                }
            }
        }
        vcs.ui.store.commit('heatmap/setMinValue', Math.round(result));
        console.log("[DEBUG] Min value: " + vcs.ui.store.getters['heatmap/getMinValue']);
    }

    getMaxValueForTimeframeDay() {
        let result = -Infinity;
        for (const entry of this.sensorDataForTimeframe[0].data) {
            if (entry.data.length > 0) {
                const maxEntryValue = Math.max(...entry.data.map(item => item.Wert));
                result = Math.max(result, maxEntryValue);
            }
        }
        if (this.backgroundDataForTimeframe.length > 0) {
            for (const entry of this.backgroundDataForTimeframe) {
                const currentValue = parseInt(entry.value);
                if (currentValue > result) {
                    result = currentValue;
                }
            }
        }
        vcs.ui.store.commit('heatmap/setMaxValue', Math.round(result));
        console.log("[DEBUG] Max value: " + vcs.ui.store.getters['heatmap/getMaxValue']);
    }

    getMeanValuesForTimeframeDefault() {
        let result = [];
        for (const day of this.sensorDataForTimeframe) {
            let currentData = [];
            day.data.forEach(hour => {
                if (hour.data.length > 0) {
                    currentData.push(hour.data);
                }
            });
            result.push(...util.calculateMeanValueForStations(...currentData));
        }
        return result;
    }

    getMinValueForTimeframeDefault() {
        const meanValues = this.getMeanValuesForTimeframeDefault();
        let result = Infinity;
        meanValues.forEach(entry => {
            if (!isNaN(entry.value)) {
                result = Math.min(result, entry.value);
            }
        });
        if (this.backgroundDataForTimeframe.length > 0) {
            for (const entry of this.backgroundDataForTimeframe) {
                const currentValue = parseInt(entry.value);
                if (currentValue < result) {
                    result = currentValue;
                }
            }
        }
        vcs.ui.store.commit('heatmap/setMinValue', Math.round(result));
        console.log("[DEBUG] Min value: " + vcs.ui.store.getters['heatmap/getMinValue']);
    }

    getMaxValueForTimeframeDefault() {
        const meanValues = this.getMeanValuesForTimeframeDefault();
        let result = -Infinity;
        meanValues.forEach(entry => {
            if (!isNaN(entry.value)) {
                result = Math.max(result, entry.value);
            }
        });
        if (this.backgroundDataForTimeframe.length > 0) {
            for (const entry of this.backgroundDataForTimeframe) {
                const currentValue = parseInt(entry.value);
                if (currentValue > result) {
                    result = currentValue;
                }
            }
        }
        vcs.ui.store.commit('heatmap/setMaxValue', Math.round(result));
        console.log("[DEBUG] Max value: " + vcs.ui.store.getters['heatmap/getMaxValue']);
    }
}
import dateUtils from "../tools/dateUtils";
import heatmapCalcUtils from "../tools/heatmapCalcUtils";

const SENSOR_DATA_FILE_PATH = "./assets/SensorData.json";
const DWD_DAILY_FILE_PATH = "./assets/DWD_daily_mean.json";
const DWD_HOURLY_FILE_PATH = "./assets/DWD_hourly.json";

export default class dataService {

    constructor() {
        this.sensorData = [];
        this.sensorDataForTimeframe = [];
        this.backgroundData = [];
        this.backgroundDataForTimeframe = [];

        const numberOfDays = dateUtils.getInclusiveDaysBetweenDates(vcs.ui.store.getters['heatmap/getStartDate'], vcs.ui.store.getters['heatmap/getEndDate']);
        this.backgroundDataFilePath = numberOfDays === 1 ? DWD_HOURLY_FILE_PATH : DWD_DAILY_FILE_PATH;
        this.mode = numberOfDays === 1 ? 'day' : 'default';
        vcs.ui.store.commit('heatmap/setMode', this.mode);
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
        }

        const sensorResponse = await fetch(SENSOR_DATA_FILE_PATH);
        const sensorJson = await sensorResponse.json();
        sensorJson.forEach(entry => {
            this.sensorData.push({
                timestamp: entry.Zeitstempel,
                data: entry.data
            });
        });
    }

    getSensorDataForTimeframe() {
        if (this.mode === 'day') {
            this.sensorData.forEach(entry => {
                if (entry.timestamp.includes(vcs.ui.store.getters['heatmap/getStartDate'])) {
                    this.sensorDataForTimeframe.push(entry);
                }
            });
        } else if (this.mode === 'default') {
            this.sensorData.forEach(entry => {
                const currentDate = new Date(entry.timestamp);
                if (currentDate >= new Date(vcs.ui.store.getters['heatmap/getStartDate']) && currentDate <= new Date(vcs.ui.store.getters['heatmap/getEndDate'])) {
                    this.sensorDataForTimeframe.push(entry);
                }
            });
        }
        vcs.ui.store.commit('heatmap/setSensorData', Object.freeze(this.sensorDataForTimeframe));
    }

    getBackgroundDataForTimeframe() {
        if (this.mode === 'day') {
            this.backgroundData.forEach(entry => {
                if (entry.timestamp.includes(vcs.ui.store.getters['heatmap/getStartDate'])) {
                    this.backgroundDataForTimeframe.push(entry);
                }
            });
        } else if (this.mode === 'default') {
            this.backgroundData.forEach(entry => {
                const currentDate = new Date(entry.timestamp);
                if (currentDate >= new Date(vcs.ui.store.getters['heatmap/getStartDate']) && currentDate <= new Date(vcs.ui.store.getters['heatmap/getEndDate'])) {
                    this.backgroundDataForTimeframe.push(entry);
                }
            });
        }
        vcs.ui.store.commit('heatmap/setBackgroundData', Object.freeze(this.backgroundDataForTimeframe));
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
                const currentValue = parseFloat(entry.value);
                if (currentValue < result) {
                    result = currentValue;
                }
            }
        }
        vcs.ui.store.commit('heatmap/setMinValue', result.toFixed(1));
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
                const currentValue = parseFloat(entry.value);
                if (currentValue > result) {
                    result = currentValue;
                }
            }
        }
        vcs.ui.store.commit('heatmap/setMaxValue', result.toFixed(1));
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
            result.push(...heatmapCalcUtils.calculateMeanValueForStations(...currentData));
        }
        return result;
    }

    getMinValueForTimeframeDefault() {
        const meanValues = this.getMeanValuesForTimeframeDefault();
        let result = Infinity;
        meanValues.forEach(entry => {
            result = Math.min(result, entry.value);
        });
        if (this.backgroundDataForTimeframe.length > 0) {
            for (const entry of this.backgroundDataForTimeframe) {
                const currentValue = parseFloat(entry.value);
                if (currentValue < result) {
                    result = currentValue;
                }
            }
        }
        vcs.ui.store.commit('heatmap/setMinValue', result.toFixed(1));
    }

    getMaxValueForTimeframeDefault() {
        const meanValues = this.getMeanValuesForTimeframeDefault();
        let result = -Infinity;
        meanValues.forEach(entry => {
            result = Math.max(result, entry.value);
        });
        if (this.backgroundDataForTimeframe.length > 0) {
            for (const entry of this.backgroundDataForTimeframe) {
                const currentValue = parseFloat(entry.value);
                if (currentValue > result) {
                    result = currentValue;
                }
            }
        }
        vcs.ui.store.commit('heatmap/setMaxValue', result.toFixed(1));
    }
}
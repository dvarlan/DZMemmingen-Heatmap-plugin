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
        this.mode = numberOfDays === 1 ? 'hours' : 'days';
        vcs.ui.store.commit('heatmap/setMode', this.mode);
    }

    /**
     * Fetches the data for backgroundData and sensorData from the JSON files in the correct format.
     */
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

    /**
     * Commits the sensorData for the user-selected timeframe into the store.
     */
    getSensorDataForTimeframe() {
        if (this.mode === 'hours') {
            this.sensorData.forEach(entry => {
                if (entry.timestamp.includes(vcs.ui.store.getters['heatmap/getStartDate'])) {
                    this.sensorDataForTimeframe.push(entry);
                }
            });
        } else if (this.mode === 'days') {
            this.sensorData.forEach(entry => {
                const currentDate = new Date(entry.timestamp);
                if (currentDate >= new Date(vcs.ui.store.getters['heatmap/getStartDate']) && currentDate <= new Date(vcs.ui.store.getters['heatmap/getEndDate'])) {
                    this.sensorDataForTimeframe.push(entry);
                }
            });
        }
        vcs.ui.store.commit('heatmap/setSensorData', Object.freeze(this.sensorDataForTimeframe));
    }

    /**
     * Commits the backgroundData for the user-selected timeframe into the store.
     */
    getBackgroundDataForTimeframe() {
        if (this.mode === 'hours') {
            this.backgroundData.forEach(entry => {
                if (entry.timestamp.includes(vcs.ui.store.getters['heatmap/getStartDate'])) {
                    this.backgroundDataForTimeframe.push(entry);
                }
            });
        } else if (this.mode === 'days') {
            this.backgroundData.forEach(entry => {
                const currentDate = new Date(entry.timestamp);
                if (currentDate >= new Date(vcs.ui.store.getters['heatmap/getStartDate']) && currentDate <= new Date(vcs.ui.store.getters['heatmap/getEndDate'])) {
                    this.backgroundDataForTimeframe.push(entry);
                }
            });
        }
        vcs.ui.store.commit('heatmap/setBackgroundData', Object.freeze(this.backgroundDataForTimeframe));
    }

    /**
     * Commits the minimum value from the sensor and background data into the store.
     */
    getMinValueForTimeframeHours() {
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

    /**
     * Commits the maximum value from the sensor and background data into the store.
     */
    getMaxValueForTimeframeHours() {
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

    /**
     * Returns the mean values for each station / sensor for each day of the user selected timeframe.
     * @returns {Array} result
     */
    getMeanValuesForTimeframeDays_() {
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

    /**
     * Commits the minimum value from the sensor and background data into the store.
     */
    getMinValueForTimeframeDays() {
        const meanValues = this.getMeanValuesForTimeframeDays_();
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

    /**
     * Commits the maximum value from the sensor and background data into the store.
     */
    getMaxValueForTimeframeDays() {
        const meanValues = this.getMeanValuesForTimeframeDays_();
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
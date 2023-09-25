<template>
    <div v-if="!selectionSubmitted" class="date-picker">
        <hr>
        <p>Please select the timeframe for the Heatmap visualisation below</p>
        <label for="start-date">Start: </label>
        <input @input="event => startDate = event.target.value" :value="startDate" style="margin-right: 5px;"
            name="start-date" min="2023-01-01" max="2023-07-31" type="date">
        <label for="end-date">End: </label>
        <input @input="event => endDate = event.target.value" :value="endDate" name="end-date" min="2023-01-01"
            max="2023-07-31" type="date">
        <div class="background-picker">
            <label for="background-value" style="pointer-events: none;">Use background value: </label>
            <input @input="event => usingBackgroundValue = event.target.checked" :checked="usingBackgroundValue"
                name="background-value" type="checkbox">
        </div>
        <div class="tooltip">
            <p>A background temperature value from the DWD (Deutscher Wetterdienst) will be inserted.
                <br>
                <span style="font-weight: bold;">This might slow down the heatmap generation for longer
                    timespans.</span>
            </p>
        </div>
        <button @click.once="submitSelection">Submit</button>
    </div>
    <div v-else class="date-picker-infos">
        <p v-if="startDate === endDate">Current Timeframe: <span class="highlighted-text">{{ startDate }} (24hrs)</span></p>
        <p v-else>Current Timeframe: <span class="highlighted-text">{{ startDate }} | {{ endDate }}</span></p>
        <p>Background value: <span class="highlighted-text">{{ usingBackgroundValue }}</span></p>
    </div>
</template>

<script>
import dataService from "../api/dataService";
import dateTools from "../tools/dateTools";

export default {
    data() {
        return {

        }
    },
    computed: {
        startDate: {
            get() {
                return this.$store.getters['heatmap/getStartDate'];
            },
            set(value) {
                this.$store.commit('heatmap/setStartDate', value);
            }
        },
        endDate: {
            get() {
                return this.$store.getters['heatmap/getEndDate'];
            },
            set(value) {
                this.$store.commit('heatmap/setEndDate', value);
            }
        },
        usingBackgroundValue: {
            get() {
                return this.$store.getters['heatmap/usingBackgroundValue'];
            },
            set(value) {
                this.$store.commit('heatmap/setBackgroundValue', value);
            }
        },
        selectionSubmitted: {
            get() {
                return this.$store.getters['heatmap/isSelectionSubmitted'];
            },
            set() {
                this.$store.commit('heatmap/submitSelection');
            }
        }
    },
    methods: {
        submitSelection() {

            if (dateTools.getInclusiveDaysBetweenDates(this.startDate, this.endDate) <= 0) {
                let temp = null;
                temp = this.startDate;
                this.startDate = this.endDate;
                this.endDate = temp;
            }

            const service = new dataService();
            service.parseData().then(() => {
                service.getSensorDataForTimeframe();

                if (this.$store.getters['heatmap/usingBackgroundValue']) {
                    service.getBackgroundDataForTimeframe();
                }

                if (this.$store.getters['heatmap/getMode'] === 'day') {
                    service.getMinValueForTimeframeDay();
                    service.getMaxValueForTimeframeDay();
                } else {
                    service.getMinValueForTimeframeDefault();
                    service.getMaxValueForTimeframeDefault();
                }
                this.selectionSubmitted = true;
            });
        }
    }
}
</script>

<style>
.background-picker {
    padding-top: 10px;
    margin-bottom: 10px;
}

.background-picker:hover {
    cursor: help;
}

.background-picker:hover+.tooltip {
    display: block;
    color: blue;
}

.tooltip {
    display: none;
}

.highlighted-text {
    font-weight: bold;
}
</style>
<template>
    <div v-if="!selectionSubmitted" class="date-picker">
        <hr>
        <p>Select the timeframe for the heatmap visualisation</p>
        <label for="start-date">Start: </label>
        <input @input="event => startDate = event.target.value" :value="startDate" style="margin-right: 5px;"
            name="start-date" min="2023-01-01" max="2023-07-31" type="date">
        <label for="end-date">End: </label>
        <input @input="event => endDate = event.target.value" :value="endDate" name="end-date" min="2023-01-01"
            max="2023-07-31" type="date">
        <div class="background-picker">
            <label for="background-value">Use background value: </label>
            <input @input="event => usingBackgroundValue = event.target.checked" :checked="usingBackgroundValue"
                name="background-value" type="checkbox">
        </div>
        <div class="tooltip">
            <p>A background temperature value from the DWD (Deutscher Wetterdienst) will be inserted.
                <br>
                <span style="font-weight: bold;">This is going to slow down the heatmap generation.</span>
            </p>
        </div>
        <button @click="submitSelection">Submit</button>
    </div>
    <div v-else class="date-picker-infos">
        <p v-if="startDate === endDate">Current Timeframe: <span class="highlighted-text">{{ startDate }} (24hrs)</span></p>
        <p v-else>Current Timeframe: <span class="highlighted-text">{{ startDate }} | {{ endDate }}</span></p>
        <p>Background value: <span class="highlighted-text">{{ usingBackgroundValue }}</span></p>
    </div>
</template>

<script>
import dataService from "../api/dataService";

export default {
    data() {
        return {
            selectionSubmitted: false,
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
        }
    },
    methods: {
        submitSelection() {
            this.selectionSubmitted = true;
            const service = new dataService();
            service.parseData().then(() => {
                service.getSensorDataForTimeframe();
                if (this.$store.getters['heatmap/getMode'] === 'day') {
                    service.getMinValueForTimeframeDay();
                    service.getMaxValueForTimeframeDay();
                } else {
                    service.getMinValueForTimeframeDefault();
                    service.getMaxValueForTimeframeDefault();
                }

                if (this.$store.getters['heatmap/usingBackgroundValue']) {
                    service.getBackgroundDataForTimeframe();
                }
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
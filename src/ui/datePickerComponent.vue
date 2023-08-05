<template>
    <div class="date-picker">
        <hr>
        <p>Select the timeframe for the heatmap visualisation</p>
        <label for="start-date">Start: </label>
        <input @input="event => startDate = event.target.value" :value="startDate" style="margin-right: 5px;"
            name="start-date" min="2023-01-01" max="2023-07-31" type="date">
        <label for="end-date">End: </label>
        <input @input="event => endDate = event.target.value" :value="endDate" name="end-date" min="2023-01-01"
            max="2023-07-31" type="date">
        <p>Current Timeframe: {{ startDate }} | {{ endDate }}</p>
        <div class="background-picker">
            <label for="background-value">Use background value: </label>
            <input @input="event => usingBackgroundValue = event.target.checked" :checked="usingBackgroundValue"
                name="background-value" type="checkbox">
        </div>
        <div class="tooltip">
            <p>A background temperature value from the DWD (Deutscher Wetterdienst) will be inserted</p>
        </div>
        <button @click="submitSelection">Submit</button>
    </div>
</template>

<script>
import dataService from "../api/dataService";

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
        }
    },
    methods: {
        submitSelection() {
            let service = new dataService();
            service.parseData().then(() => {
                service.getSensorDataForTimeframe();
            });
        }
    }
}
</script>

<style>
.background-picker {
    margin-bottom: 10px;
}

.background-picker:hover+.tooltip {
    display: block;
    color: blue;
}

.tooltip {
    display: none;
}
</style>
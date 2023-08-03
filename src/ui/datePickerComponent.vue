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
        <button>Submit</button>
    </div>
</template>

<script>
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
        }
    }
}
</script>
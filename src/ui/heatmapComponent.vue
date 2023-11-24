<template>
  <div>
    <div>
      <CloseButton></CloseButton>
      <h2>Heatmap Plugin</h2>
    </div>
    <div class="scroll-wrap">
      <DatePickerComponent @selectionChanged="initialize"></DatePickerComponent>
      <hr>
      <div v-if="isLoading" class="loading-screen">
        <h1>Generating heatmaps please wait...</h1>
      </div>
      <div v-if="selectionSubmitted && !isLoading">
        <div class="options">
          <h3>Options</h3>
          <div class="station-controls">
            <label for="stations cbox">Show stations: </label>
            <input v-model="showingStations" type="checkbox" name="stations-cbox" @change="toggleStations">
          </div>
          <input v-model="animationSpeed" :disabled="animationId" type="range" min="1" max="5">
          <br>
          <label>Animation speed: {{ animationSpeed }} sec.</label>
          <br>
          <button class="vcm-btn-project-list" @click="clear">Clear heatmap</button>
        </div>
        <div v-if="showingHeatmap" class="animation-controls">
          <hr>
          <h3>Animation controls</h3>
          <input v-model="currentHeatmapIndex" @change="changeToSelectedCanvas" :disabled="animationId" type="range"
            min="0"
            :max="this.$store.getters['heatmap/getMode'] === 'default' ? this.$store.getters['heatmap/getSensorData'].length - 1 : 23">
          <p>Date / time: {{ getLabelForIndex(currentHeatmapIndex) }}</p>
          <button v-if="!animationId" class="animation-control-button" @click="startAnimation">{{ currentHeatmapIndex > 0
            ?
            "Resume" : "Start" }}</button>
          <button v-if="animationId" class="animation-control-button" @click="stopAnimation">Stop</button>
          <br>
          <br>
          <div class="heatmap-legend">
            <h3>Legend for current timeframe</h3>
            <br>
            <div class="color-gradiant">
              <p id="min-value">{{ this.$store.getters['heatmap/getMinValue'] + "°C" }}</p>
              <p id="max-value">{{ this.$store.getters['heatmap/getMaxValue'] + "°C" }}</p>
            </div>
          </div>
          <div class="heatmap-legend-tooltip">
            <br>
            <span>These are the min and max values used for the heatmap generation of the current timeframe. Due to
              interpolation these exact values might not appear on the final visualisation.</span>
          </div>
        </div>
        <hr>
      </div>
    </div>
  </div>
</template>
<script>
import pointProvider from '../api/pointProvider';
import DatePickerComponent from './datePickerComponent.vue';
import heatmapProvider from '../api/heatmapProvider';

let myheatmapProvider = new heatmapProvider();
let provider = new pointProvider();

export default {
  name: 'heatmapComponent',
  components: { DatePickerComponent },
  data() {
    return {
      animationId: null,
      heatmapLabel: this.$store.getters['heatmap/getCurrentLabel'],
      isLoading: false,
      currentHeatmapIndex: myheatmapProvider.currentTimestampIndex - 1,
    };
  },
  computed: {
    showingHeatmap() {
      return this.$store.getters['heatmap/isHeatmapVisible'];
    },
    selectionSubmitted() {
      return this.$store.getters['heatmap/isSelectionSubmitted'];
    },
    showingStations() {
      return this.$store.getters['heatmap/showingStations'];
    },
    animationSpeed: {
      get() {
        return this.$store.getters['heatmap/currentAnimationSpeed'];
      },
      set(value) {
        this.$store.commit('heatmap/changeAnimationSpeed', value);
      }
    }
  },
  methods: {
    initialize() {
      this.initStations();
      this.drawHeatmap();
    },
    initStations() {
      // Commented out bc the dataset is only for 6 sensors & this function fetches all sensor points

      //provider.fetchStationPoints().then(() => {
      //  provider.convertPointsToCesiumDataSource();
      //  provider.drawStationPoints();
      //});

      provider.fetchStationPointsForDataset();
      provider.convertPointsToCesiumDataSource();
    },
    drawHeatmap() {
      this.isLoading = true;
      window.setTimeout(() => {
        myheatmapProvider.createHeatmapContainers();
        if (this.$store.getters['heatmap/getMode'] === 'day') {
          myheatmapProvider.createHeatmapsForDays();
        } else {
          myheatmapProvider.createHeatmapsForDefault();
        }
        this.$store.commit('heatmap/showHeatmap');
        this.isLoading = false;
      }, 100)
    },
    toggleStations() {
      this.showingStations ? provider.hideStationPoints() : provider.drawStationPoints();
      this.$store.commit('heatmap/showStations', !this.showingStations);
    },
    changeHeatmapCanvas(changedByUser) {
      const heatmapAmount = document.getElementById('heatmap-container-wrapper').children.length - 1;
      myheatmapProvider.changeToNextHeatmap();
      if (parseInt(this.currentHeatmapIndex) === heatmapAmount && changedByUser) {
        this.currentHeatmapIndex = heatmapAmount;
      } else if (parseInt(this.currentHeatmapIndex) === heatmapAmount) {
        this.currentHeatmapIndex = 0;
      } else if (!changedByUser) {
        this.currentHeatmapIndex++;
      }
      this.heatmapLabel = this.$store.getters['heatmap/getCurrentLabel'];
    },
    getLabelForIndex(index) {
      if (index < 0) {
        return 'The animation is currently paused';
      }
      return document.getElementById('heatmap-container-wrapper').children[index].getAttribute('id');
    },
    changeToSelectedCanvas() {
      myheatmapProvider.currentTimestampIndex = parseInt(this.currentHeatmapIndex);
      this.changeHeatmapCanvas(true);
    },
    startAnimation() {
      this.stopAnimation();
      this.animationId = window.setInterval(this.changeHeatmapCanvas, this.animationSpeed * 1000, false);
    },
    stopAnimation() {
      if (this.animationId !== null) {
        window.clearInterval(this.animationId);
        this.animationId = null;
      }
    },
    clear() {
      this.stopAnimation();
      this.currentHeatmapIndex = -1;
      provider.clear();
      myheatmapProvider.clear();
      this.$store.commit('heatmap/reset');
      this.heatmapLabel = this.$store.getters['heatmap/getCurrentLabel'];
    }
  },
  beforeDestroy() {
    this.stopAnimation();
  }
};
</script>
<style scoped>
h2 {
  margin: 1.2rem 1px;
}

.scroll-wrap {
  position: absolute;
  top: 3.5rem;
  left: 0;
  right: 0;
  bottom: .5rem;
  padding: 0 .5rem;
  overflow: auto;
}

.animation-controls .animation-control-button {
  width: 100px;
}

.options {
  display: flex;
  align-items: center;
  flex-direction: column;
}

.station-controls {
  display: flex;
  align-items: center;
}

.color-gradiant {
  display: flex;
  justify-content: space-between;
  height: 20px;
  font-weight: bold;
  background: linear-gradient(to right,
      rgb(0, 0, 255) 25%,
      rgb(0, 255, 0) 55%,
      yellow 85%,
      rgb(255, 0, 0) 100%);

  #min-value {
    color: white;
    margin-top: 2px;
    padding-left: 2px;
  }

  #max-value {
    margin-top: 2px;
    padding-right: 2px;
  }
}

.heatmap-legend-tooltip {
  display: none;
}

.heatmap-legend:hover {
  cursor: help;
}

.heatmap-legend:hover+.heatmap-legend-tooltip {
  display: block;
  color: blue;
}

.loading-screen {
  pointer-events: none;
}
</style>

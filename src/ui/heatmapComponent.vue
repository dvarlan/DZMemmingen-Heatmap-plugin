<template>
  <div>
    <div>
      <CloseButton></CloseButton>
      <h2>Heatmap Plugin</h2>
    </div>
    <div class="scroll-wrap">
      <DatePickerComponent></DatePickerComponent>
      <hr>
      <div v-if="isLoading" class="loading-screen">
        <h1>Generating Heatmaps please wait...</h1>
      </div>
      <div v-if="selectionSubmitted && !isLoading" class="buttons">
        <button class="vcm-btn-project-list" @click="drawStations" :disabled="showingStations">Add Stationpoints</button>
        <br>
        <br>
        <button class="vcm-btn-project-list" @click="drawHeatmap" :disabled="showingHeatmap">Draw Heatmap</button>
        <br>
        <div v-if="showingHeatmap" class="animation-controls">
          <br>
          <h3>Animation controls</h3>
          <p>Current Heatmap: {{ heatmapLabel }}</p>
          <input v-model="animationSpeed" :disabled="animationId" type="range" min="1" max="5">
          <br>
          <label>Animation Speed: {{ animationSpeed }} sec.</label>
          <br>
          <button @click="startAnimation">Start / Resume</button>
          <button @click="stopAnimation">Stop</button>
          <br>
          <br>
          <h3>Legend for current Timeframe</h3>
          <br>
          <div class="color-gradiant">
            <p id="min-value">{{ this.$store.getters['heatmap/getMinValue'] + "°C" }}</p>
            <p id="max-value">{{ this.$store.getters['heatmap/getMaxValue'] + "°C" }}</p>
          </div>
        </div>
        <br>
        <button class="vcm-btn-project-list" @click="clear">Clear</button>
        <hr>
      </div>
    </div>
  </div>
</template>
<script>
import pointProvider from '../api/pointProvider';
import DatePickerComponent from './datePickerComponent.vue';
import heatmapProvider from '../api/heatmapHandler';

// Evtl. in mounted
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
    drawStations() {
      console.log("[DEBUG] Drawing stations...");
      provider.fetchStationPoints().then(() => {
        provider.drawStationPoints(provider.getPointsAsCesiumDataSource());
      });
      this.$store.commit('heatmap/showStations');
    },
    drawHeatmap() {
      this.isLoading = true;
      console.log("[DEBUG] Drawing heatmap... ");
      window.setTimeout(() => {
        myheatmapProvider.createHeatmapContainers();
        if (this.$store.getters['heatmap/getMode'] === 'day') {
          myheatmapProvider.createHeatmapsForDays();
        } else {
          myheatmapProvider.createHeatmapsForDefault();
        }
        this.$store.commit('heatmap/showHeatmap');
        this.isLoading = false;
      }, 10)
    },
    changeHeatmapCanvas() {
      console.log("[DEBUG] Changing heatmap canvas...");
      myheatmapProvider.changeToNextHeatmap();
      this.heatmapLabel = this.$store.getters['heatmap/getCurrentLabel'];
    },
    startAnimation() {
      this.stopAnimation();
      this.animationId = window.setInterval(this.changeHeatmapCanvas, this.animationSpeed * 1000);
    },
    stopAnimation() {
      if (this.animationId !== null) {
        window.clearInterval(this.animationId);
        this.animationId = null;
      }
    },
    clear() {
      this.stopAnimation();
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

.buttons {
  padding: .5rem 0 0 0;
}

.animation-controls button {
  margin-left: 6px;
  margin-top: 15px;
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

.loading-screen {
  pointer-events: none;
}
</style>

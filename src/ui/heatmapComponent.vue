<template>
  <div>
    <div>
      <CloseButton></CloseButton>
      <h2>Heatmap Plugin</h2>
    </div>
    <div class="scroll-wrap">
      <DatePickerComponent></DatePickerComponent>
      <div class="buttons">
        <hr>
        <button class="vcm-btn-project-list" @click="drawStations">Add Stationpoints</button>
        <br>
        <br>
        <button class="vcm-btn-project-list" @click="drawHeatmap" :disabled="showingHeatmap">Draw Heatmap</button>
        <br>
        <br>
        <input v-model="heatmapRadiusSize" :disabled="showingHeatmap" type="range" min="1" max="500">
        <br>
        <label>Heatmap radius size: {{ heatmapRadiusSize }}</label>
        <br>
        <div v-if="showingHeatmap" class="animation-controls">
          <br>
          <h3>Animation controls</h3>
          <p v-if="currentHeatmapTime">Current time: {{ currentHeatmapTime }}</p>
          <input v-model="animationSpeed" :disabled="animationId" type="range" min="1" max="5">
          <br>
          <label>Animation Speed: {{ animationSpeed }} sec.</label>
          <br>
          <button @click="startAnimation">Start / Resume</button>
          <button @click="stopAnimation">Stop</button>
        </div>
        <br>
        <button class="vcm-btn-project-list" @click="clear">Clear</button>
        <hr>
      </div>
    </div>
  </div>
</template>
<script>
import heatmap from '../api/heatmapProvider';
import pointProvider from '../api/pointProvider';
import DatePickerComponent from './datePickerComponent.vue';

export default {
  name: 'heatmapComponent',
  data() {
    return {
      currentHeatmapTime: this.getCurrentTime(),
      heatmapRadiusSize: 40,
      animationId: null,
    };
  },
  computed: {
    showingHeatmap() {
      return this.$store.getters['heatmap/isHeatmapVisible'];
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
      const provider = new pointProvider();
      provider.fetchStationPoints().then(() => {
        provider.drawStationPoints(provider.getPointsAsCesiumDataSource());
      });
    },
    drawHeatmap() {
      console.log("[DEBUG] Drawing heatmap...");
      this.$store.commit('heatmap/showHeatmap');
      const heatmapInstance = heatmap.getInstance();
      heatmapInstance.heatmapConfig.radius = this.heatmapRadiusSize;
      heatmapInstance.createHeatmapContainers();
      heatmapInstance.createHeatmapCanvasForContainers();
    },
    changeHeatmapCanvas() {
      console.log("[DEBUG] Changing heatmap canvas...");
      const heatmapInstance = heatmap.getInstance();
      heatmapInstance.changeToNextHeatmapCanvas();
      this.getCurrentTime();
    },
    getCurrentTime() {
      const heatmapInstance = heatmap.getInstance();
      let time = heatmapInstance.currentTime - 1;
      if (time >= 10) {
        this.currentHeatmapTime = `${time}:00`;
      }
      else {
        this.currentHeatmapTime = `0${time}:00`;
      }
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
      this.currentHeatmapTime = null;
      this.$store.commit('heatmap/resetAnimationSpeed');
      const heatmapInstance = heatmap.getInstance();
      heatmapInstance.clearLayers();
      this.$store.commit('heatmap/clearHeatmap');
    }
  },
  beforeDestroy() {
    this.stopAnimation();
  },
  components: { DatePickerComponent }
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
</style>

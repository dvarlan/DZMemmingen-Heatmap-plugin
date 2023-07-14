<template>
  <div>
    <div>
      <CloseButton></CloseButton>
      <h2>Heatmap Plugin</h2>
    </div>
    <div class="scroll-wrap">
      <div class="buttons">
        <hr>
        <button class="vcm-btn-project-list" @click="drawStations3D">Add Stationpoints</button>
        <br>
        <br>
        <button class="vcm-btn-project-list" @click="drawHeatmap" :disabled="showingHeatmap">Draw Heatmap</button>
        <br>
        <div v-if="showingHeatmap" class="animation-controls">
          <br>
          <h3>Animation controls</h3>
          <p>Current time: {{ currentHeatmapTime }}</p>
          <input v-model="animationSpeed" id="time-slider" type="range" min="1" max="5">
          <br>
          <label>Animation Speed: {{ animationSpeed }} sec.</label>
          <br>
          <button @click="startAnimation">Start</button>
          <button @click="stopAnimation">Stop</button>
        </div>
        <hr>
        <button class="vcm-btn-project-list" @click="clear">Clear</button>
      </div>
    </div>
  </div>
</template>
<script>
import heatmap from '../api/heatmapProvider';

window.onbeforeunload = () => {
  localStorage.clear();
}

export default {
  name: 'heatmapComponent',
  data() {
    return {
      //TODO: i18n
      showingHeatmap: false,
      currentHeatmapTime: this.getCurrentTime(),
      animationId: null,
      animationSpeed: 1
    };
  },
  methods: {
    drawStations3D() {
      console.log("[DEBUG] Drawing stations...")
      const heatmapInstance = heatmap.getInstance();
      heatmapInstance.drawStationPoints3D();
    },
    drawHeatmap() {
      console.log("[DEBUG] Drawing heatmap...");

      this.showingHeatmap = true;
      localStorage.setItem("showingHeatmap", true);

      const heatmapInstance = heatmap.getInstance();
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
      } else {
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
      localStorage.clear();
      this.currentHeatmapTime = null;
      this.animationSpeed = 1;

      const heatmapInstance = heatmap.getInstance();
      heatmapInstance.clearLayers();

      this.showingHeatmap = false;
    }
  },
  mounted() {
    localStorage.getItem("showingHeatmap") ? this.showingHeatmap = true : this.showingHeatmap = false;
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

.info-button {
  margin-left: 5px;
}
</style>

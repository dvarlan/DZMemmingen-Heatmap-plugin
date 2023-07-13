<template>
  <div>
    <div>
      <CloseButton></CloseButton>
      <h2>Heatmap Plugin</h2>
    </div>
    <div class="scroll-wrap">
      <div class="buttons">
        <hr>
        <button class="vcm-btn-project-list" @click="drawStations3D">Add Stations</button>
        <br>
        <br>
        <button class="vcm-btn-project-list" @click="drawHeatmap">Draw Heatmap</button>
        <br>
        <br>
        <button class="vcm-btn-project-list" @click="changeHeatmapCanvas">Change Heatmap canvas</button>
        <hr>
        <button class="vcm-btn-project-list" @click="reload">Reset</button>
      </div>
    </div>
  </div>
</template>
<script>
import heatmap from '../api/heatmapProvider';

export default {
  name: 'heatmapComponent',
  data() {
    return {
      //TODO: i18n
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
      const heatmapInstance = heatmap.getInstance();
      heatmapInstance.createHeatmapContainers();
      heatmapInstance.createHeatmapCanvasForContainers();
    },
    changeHeatmapCanvas() {
      console.log("[DEBUG] Changing heatmap canvas...");
      const heatmapInstance = heatmap.getInstance();
      heatmapInstance.changeToNextHeatmapCanvas();
    },
    reload() {
      window.location.reload();
    }
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

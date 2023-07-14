<template>
  <a href="#/heatmap" class="vcm-btn-base-splash-hover" title="Heatmap Plugin">
    <i class="fa fa-thermometer-full heatmap-btn" aria-hidden="true" />
  </a>
</template>

<script>
export default {
  name: 'pluginButton'
}
</script>

<style scoped>
.heatmap-btn {
  padding-top: 7px;
  font-size: 24px;
  color: grey;
}
.vcm-btn-base-splash-hover:hover .heatmap-btn {
  color: white;
}
</style>

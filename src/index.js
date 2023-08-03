import { version } from '../package.json';
import heatmapComponent from './ui/heatmapComponent';
import widgetButton from './ui/widgetButton';

const routes = [{
  name: 'heatmap',
  path: '/heatmap',
  component: heatmapComponent,
}];

export default {
  version,
  registerUiPlugin: async () => ({
    name: 'HeatmapPlugin',
    supportedMaps: ['vcs.vcm.maps.Cesium'], // The plugin will only be available in 3D
    routes,
    widgetButton,
    store: {
      state: {
        showingHeatmap: false,
        animationSpeed: 1,
      },
      mutations: {
        showHeatmap(state) {
          state.showingHeatmap = true;
        },
        clearHeatmap(state) {
          state.showingHeatmap = false;
        },
        changeAnimationSpeed(state, value) {
          state.animationSpeed = value;
        },
        resetAnimationSpeed(state) {
          state.animationSpeed = 1;
        }
      },
      getters: {
        isHeatmapVisible(state) {
          return state.showingHeatmap;
        },
        currentAnimationSpeed(state) {
          return state.animationSpeed;
        }
      }
    }
  }),
};
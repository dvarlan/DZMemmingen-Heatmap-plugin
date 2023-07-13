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
    name: 'heatmap',
    supportedMaps: ['vcs.vcm.maps.Cesium'], // The plugin will only be available in 3D
    routes,
    widgetButton,
  }),
};
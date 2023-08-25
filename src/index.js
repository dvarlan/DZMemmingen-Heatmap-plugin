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
    supportedMaps: ['vcs.vcm.maps.Cesium'],
    routes,
    widgetButton,
    store: {
      state: {
        showingHeatmap: false,
        showingStations: false,
        animationSpeed: 1,
        startDate: '2023-01-01',
        endDate: '2023-07-31',
        backgroundValue: false,
        mode: '',
        sensorData: [],
        backgroundData: [],
        minValue: -1337,
        maxValue: 1337,
        currentLabel: 'The animation is currently paused',
        selectionSubmitted: false,
      },
      mutations: {
        showHeatmap(state) {
          state.showingHeatmap = true;
        },
        showStations(state) {
          state.showingStations = true;
        },
        changeAnimationSpeed(state, value) {
          state.animationSpeed = value;
        },
        setStartDate(state, value) {
          state.startDate = value;
        },
        setEndDate(state, value) {
          state.endDate = value;
        },
        setBackgroundValue(state, value) {
          state.backgroundValue = value;
        },
        setMode(state, value) {
          state.mode = value;
        },
        setSensorData(state, value) {
          state.sensorData = value;
        },
        setBackgroundData(state, value) {
          state.backgroundData = value;
        },
        setMinValue(state, value) {
          state.minValue = value;
        },
        setMaxValue(state, value) {
          state.maxValue = value;
        },
        setCurrentLabel(state, value) {
          state.currentLabel = value;
        },
        submitSelection(state) {
          state.selectionSubmitted = true;
        },
        reset(state) {
          state.showingHeatmap = false;
          state.showingStations = false;
          state.animationSpeed = 1;
          state.startDate = '2023-01-01';
          state.endDate = '2023-07-31';
          state.backgroundValue = false;
          state.mode = '';
          state.sensorData = [];
          state.backgroundData = [];
          state.minValue = -1337;
          state.maxValue = 1337;
          state.currentLabel = 'The animation is currently paused';
          state.selectionSubmitted = false;
        }
      },
      getters: {
        isHeatmapVisible(state) {
          return state.showingHeatmap;
        },
        showingStations(state) {
          return state.showingStations;
        },
        currentAnimationSpeed(state) {
          return state.animationSpeed;
        },
        getStartDate(state) {
          return state.startDate;
        },
        getEndDate(state) {
          return state.endDate;
        },
        usingBackgroundValue(state) {
          return state.backgroundValue;
        },
        getMode(state) {
          return state.mode;
        },
        getSensorData(state) {
          return state.sensorData;
        },
        getBackgroundData(state) {
          return state.backgroundData;
        },
        getMinValue(state) {
          return state.minValue;
        },
        getMaxValue(state) {
          return state.maxValue;
        },
        getCurrentLabel(state) {
          return state.currentLabel;
        },
        isSelectionSubmitted(state) {
          return state.selectionSubmitted;
        }
      }
    }
  }),
};
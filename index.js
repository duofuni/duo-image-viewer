import viewer from './src/index.vue'

const duoImageViewer = {
  install: Vue => {
    Vue.component('duo-image-viewer', viewer)
  }
}

export default duoImageViewer
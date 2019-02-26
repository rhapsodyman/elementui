import es6Promise from 'es6-promise' // https://forum.vuejs.org/t/nothing-but-blank-pages-in-internet-explorer-11/5638/18
es6Promise.polyfill()

import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import App from './App.vue'
import store from './store/store.js'
import locale from 'element-ui/lib/locale/lang/en'


Vue.use(ElementUI, { locale })

new Vue({
  el: '#app',
  render: h => h(App),
  store: store
})

import Vue from 'vue'
Vue.config.productionTip = false

import axios from 'axios'
Vue.http = Vue.prototype.$http = axios

import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon'
Vue.component('icon', Icon)

import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css'
Vue.component('v-select', Multiselect)

import VModal from 'vue-js-modal'
Vue.use(VModal)

import App from './App'
import router from './router'

import store from './store/store'
import './styles/main.scss'

new Vue({
  components: {App},
  store,
  router,
  template: '<App/>'
}).$mount('#app')

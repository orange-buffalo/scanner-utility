import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'

import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon'

import './styles/main.scss'

Vue.http = Vue.prototype.$http = axios

Vue.config.productionTip = false
Vue.component('icon', Icon)

new Vue({
  components: {App},
  router,
  template: '<App/>'
}).$mount('#app')

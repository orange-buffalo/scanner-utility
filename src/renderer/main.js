import Vue from 'vue'
import axios from 'axios'
import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css'
import VModal from 'vue-js-modal'
import VueAwesomeSwiper from 'vue-awesome-swiper'
import 'swiper/dist/css/swiper.css'

import App from './App'
import router from './router'
import './styles/main.scss'
import store from './store/store'

Vue.config.productionTip = false
Vue.http = Vue.prototype.$http = axios
Vue.component('icon', Icon)
Vue.component('v-select', Multiselect)
Vue.use(VModal)
Vue.use(VueAwesomeSwiper)

new Vue({
  components: {App},
  store: store,
  router,
  template: '<App/>'
}).$mount('#app')

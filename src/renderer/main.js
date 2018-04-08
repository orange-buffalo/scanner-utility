import Vue from 'vue'
import axios from 'axios'
import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css'
import VModal from 'vue-js-modal'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import {Dropdown} from 'bootstrap-vue/es/components'
import {Button} from 'bootstrap-vue/es/components'

import App from './App'
import router from './router'
import store from './store/store'
import './styles/main.scss'

Vue.config.productionTip = false
Vue.http = Vue.prototype.$http = axios
Vue.component('icon', Icon)
Vue.component('v-select', Multiselect)
Vue.use(VModal)
Vue.use(Dropdown)
Vue.use(Button)

new Vue({
  components: {App},
  store,
  router,
  template: '<App/>'
}).$mount('#app')

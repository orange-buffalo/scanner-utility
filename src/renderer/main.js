import Vue from 'vue'
import axios from 'axios'

import iView from 'iview'
import App from './App'
import router from './router'

import 'reset-css/reset.css'
import '!css-loader!less-loader!./iview.less'

Vue.use(iView);
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  template: '<App/>'
}).$mount('#app')

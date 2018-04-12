import Vue from 'vue'
import Vuex from 'vuex'
import scannersStore from '../scanners/scanners-store'
import sessionStore from '../scan-session/session-store'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    session: {
      namespaced: true,
      ...sessionStore
    },
    scanners: {
      namespaced: true,
      ...scannersStore
    }
  }
})

export default store
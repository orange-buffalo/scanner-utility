import Vue from 'vue'
import Vuex from 'vuex'
import {NEW_SCANNER, SET_SCANNER_CONFIG} from './mutations'

Vue.use(Vuex)

let scannerId = 42

const store = new Vuex.Store({
  state: {
    scanners: []
  },

  mutations: {
    [NEW_SCANNER](state, scanner) {
      state.scanners.push({...scanner, id: scannerId, config: {}})
      scannerId++
    },

    [SET_SCANNER_CONFIG](state, payload) {
      let scannerIndex = state.scanners.findIndex(scanner => scanner.id === payload.scannerId)
      let scanner = state.scanners[scannerIndex]
      scanner.config = payload.config
    }
  },

  getters: {
    getScannerById: (state) => (id) => {
      return state.scanners.find(scanner => scanner.id === id)
    }
  }
})

export default store
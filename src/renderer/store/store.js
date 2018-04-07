import Vue from 'vue'
import Vuex from 'vuex'
import {NEW_SCANNER, SET_SCANNER_CONFIG, SCANNER_UPDATED} from './mutations'
import _ from 'lodash'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    scanners: []
  },

  mutations: {
    [NEW_SCANNER](state, scanner) {
      state.scanners.push(scanner)
    },

    [SET_SCANNER_CONFIG](state, payload) {
      let scannerIndex = state.scanners.findIndex(scanner => scanner.id == payload.scannerId)
      let scanner = state.scanners[scannerIndex]
      scanner.config = payload.config
    },

    [SCANNER_UPDATED](state, payload) {
      let scannerIndex = state.scanners.findIndex(scanner => scanner.id == payload.scannerId)
      let scanner = state.scanners[scannerIndex]
      _.assign(scanner, payload.changeSet)
    }
  },

  getters: {
    getScannerById: (state) => (id) => {
      return state.scanners.find(scanner => scanner.id === id)
    }
  }
})

export default store
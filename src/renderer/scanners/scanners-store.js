import {NEW_SCANNER, SET_SCANNER_CONFIG, SCANNER_UPDATED} from './scanners-mutations'
import _ from 'lodash'

const scannersStore = {
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
    getScannerById: state => id => state.scanners.find(scanner => scanner.id == id)
  }
}

export default scannersStore
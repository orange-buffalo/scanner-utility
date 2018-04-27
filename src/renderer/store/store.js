import Vue from 'vue'
import Vuex from 'vuex'
import {scannersStore} from '../scanners/scanners-store'
import sessionStore from '../scan-session/session-store'
import {ipcRenderer} from 'electron'
import log from 'electron-log'

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

ipcRenderer.on('quit-request', (event, args) => {
      log.info('request to close application', args)

      if (args.force || store.state.session.allChangesSaved) {
        store.dispatch('session/clear')
        event.sender.send('quit-response', {canClose: true})
      }
      else {
        log.info('there are unsaved changes')

        event.sender.send('quit-response', {
          canClose: false,
          pagesCount: store.state.session.pages.length
        })
      }
    }
)

export default store
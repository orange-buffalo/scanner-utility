import _ from 'lodash'
import log from 'electron-log'
import {Status} from './scanner-api'
import {eSclScannerProvider} from './eSCL/eSclScannerProvider'

let scannerNextId = 42

class Scanner {

  constructor(options) {
    this.name = options.name
    this.address = options.address
    this.status = Status.PENDING
    this.id = scannerNextId++
    this.config = {}
    this.capabilities = {
      colorModes: [],
      resolutions: [],
      maxWidth: null,
      maxHeight: null
    }
  }

  get isReady() {
    return this.status == Status.READY
  }

  get isPending() {
    return this.status == Status.PENDING
  }

  get isFailed() {
    return this.status == Status.FAILED
  }

  get isScanning() {
    return this.status == Status.SCANNING
  }
}

function updateScannerConfig(scanner, newConfig) {
  scanner.config = _.extend({}, scanner.config, newConfig)
}

export let scannersStore = {
  state: {
    scanners: [],
    activeScanner: null
  },

  getters: {
    getScannerById: state => id => state.scanners.find(scanner => scanner.id == id)
  },

  actions: {
    startSearching: function (context) {
      if (this._searching) {
        log.debug('scanners providers are already initialized')
      }
      else {
        this.scannerProviders = []
        this.scannersToProviders = []
        this._searching = true
        let callbacks = {
          onNewScanner: (provider, options) => {
            let scanner = new Scanner(options)
            this.scannersToProviders[scanner.id] = provider
            context.state.scanners.push(scanner)
            return scanner.id
          },

          onScannerStatusChange: (scannerId, status) => {
            context.getters.getScannerById(scannerId).status = status
          },

          onCapabilitiesRetrieved: (scannerId, capabilities) => {
            let scanner = context.getters.getScannerById(scannerId)
            scanner.capabilities = _.extend({}, scanner.capabilities, capabilities)

            updateScannerConfig(scanner, {
              resolution: scanner.capabilities.resolutions.find((r) => {
                return r.isDefault
              }),
              colorMode: scanner.capabilities.colorModes.find((cm) => {
                return cm.isDefault
              })
            })
          }
        }

        this.scannerProviders.push(new eSclScannerProvider(callbacks))

        if (process.env.NODE_ENV === 'development') {
          let DevScannerProvider = require('./dev/DevScannerProvider').DevScannerProvider
          this.scannerProviders.push(new DevScannerProvider(callbacks))
        }

        log.info('initialized scanners providers')
      }
    },

    setActiveScanner: function (context, scannerId) {
      context.state.activeScanner = context.getters.getScannerById(scannerId)
    },

    startScanning: function (context) {
      return new Promise((resolve => {
        let scanner = context.state.activeScanner
        scanner.status = Status.SCANNING

        context.dispatch('session/createNewPage', {
              width: scanner.capabilities.maxWidth,
              height: scanner.capabilities.maxHeight
            }, {root: true}
        ).then((page) => {

          log.info('starting scanning new page', page)

          resolve(page)

          this.scannersToProviders[scanner.id].scanPage(
              scanner.id,

              scanner.config,

              page.fileName,

              () => {
                log.info('successfully scanned', page)

                context.dispatch('session/updatePageProgress', {
                      pageId: page.id,
                      percent: 100
                    }, {root: true}
                )
                scanner.status = Status.READY
              },

              percent => {
                log.debug('scan progress %s at %s', page.fileName, percent)

                context.dispatch('session/updatePageProgress',
                    {
                      pageId: page.id,
                      percent: percent
                    },
                    {root: true}
                )

                log.debug('updated page: %j', page)
              },

              (error) => {
                log.error('error while communicating with scanner', scanner, error)

                context.dispatch('session/failPageScan', page, {root: true})
                scanner.status = Status.READY
              }
          )
        })
      }))
    },

    updateScannerConfig(context, request) {
      let scanner = context.getters.getScannerById(request.scannerId)
      updateScannerConfig(scanner, request.newConfig)
    }
  }
}
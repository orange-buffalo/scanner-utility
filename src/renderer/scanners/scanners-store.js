import _ from 'lodash'
import bonjour from 'bonjour'
import axios from 'axios'
import log from 'electron-log'
import xml2js from 'xml2js'
import CapabilitiesReader from './_capabilities-reader'
import fs from 'fs'
import request from 'request'
import progress from 'request-progress'

function readCapabilities(scanner, rawCapabilities, context) {
  let capabilities = {
    colorModes: [],
    resolutions: []
  }

  if (new CapabilitiesReader(rawCapabilities, scanner)
      .mandatoryElement('scan:ScannerCapabilities')
      .mandatoryElement('scan:Platen')
      .mandatoryElement('scan:PlatenInputCaps')
      .mandatoryElement('scan:MaxWidth')
      .readElement(text => capabilities.maxWidth = text)
      .up()
      .mandatoryElement('scan:MaxHeight')
      .readElement(text => capabilities.maxHeight = text)
      .up()
      .mandatoryElement('scan:SettingProfiles')
      .mandatoryElement('scan:SettingProfile')
      .mandatoryElement('scan:ColorModes')
      .mandatoryElements('scan:ColorMode')
      .readElement((text, isDefault) => capabilities.colorModes.push({
        name: text,
        isDefault: isDefault
      }))
      .up()
      .up()
      .mandatoryElement('scan:SupportedResolutions')
      .mandatoryElement('scan:DiscreteResolutions')
      .mandatoryElements('scan:DiscreteResolution')
      .forEach(discreteResolutionReader => {
        discreteResolutionReader
            .mandatoryElement('scan:XResolution')
            .readElement((text, isDefault) => capabilities.resolutions.push({
              value: text,
              isDefault: isDefault
            }))
      })
      .isValid()) {

    scanner.capabilities = _.extend({}, scanner.capabilities, capabilities)
    scanner.status = Status.READY

    updateScannerConfig(scanner, {
      resolution: scanner.capabilities.resolutions.find((r) => {
        return r.isDefault
      }),
      colorMode: scanner.capabilities.colorModes.find((cm) => {
        return cm.isDefault
      })
    })

    log.info('retrieved capabilities for scanner:', JSON.stringify(this))
  }
  else {
    scanner.status = Status.FAILED
  }
}

let scannerNextId = 42

export let Status = {
  PENDING: 1,
  FAILED: 2,
  READY: 3,
  SCANNING: 4
}

class Scanner {

  constructor(service) {
    this.name = service.txt.ty
    this.address = service.addresses.join(', ')
    this.status = Status.PENDING
    this.id = scannerNextId++
    this.config = {}
    this.capabilities = {
      colorModes: [],
      resolutions: [],
      maxWidth: null,
      maxHeight: null
    }
    this._$http = axios.create({
      baseURL: 'http://' + service.host + ':' + service.port + '/eSCL',
      timeout: 20000
    })
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

// todo remove
let defaultService = {
  txt: {ty: 'test'},
  addresses: []
}

function updateScannerConfig(scanner, newConfig) {
  scanner.config = _.extend({}, scanner.config, newConfig)
}

export let scannersStore = {
  state: {
    // scanners: [],
    _searching: false,

    activeScanner: null,

    // todo remove
    scanners: [
      _.extend(new Scanner(defaultService), {
        name: 'Cannon TS9080 Series',
        address: '192.168.1.1',
        status: Status.PENDING,
        id: scannerNextId++,
        capabilities: {},
        config: {}
      }),

      _.extend(new Scanner(defaultService), {
        name: 'Cannon PIXMA MG7550 Series - For Tests',
        address: '192.168.1.170',
        status: Status.READY,
        id: scannerNextId++,
        capabilities: {
          maxWidth: 2550,
          maxHeight: 3508,
          colorModes: [
            {
              name: "RGB24",
              isDefault: true
            },
            {
              name: "Greyscale",
              isDefault: false
            }
          ],
          resolutions: [
            {
              value: "75",
              isDefault: false
            },
            {
              value: "100",
              isDefault: false
            },
            {
              value: "300",
              isDefault: true
            },
            {
              value: "600",
              isDefault: false
            }
          ]
        },
        config: {}
      }),

      _.extend(new Scanner(defaultService), {
        name: 'HP Test Connection Scanner New Generation',
        address: '192.168.45.170',
        status: Status.FAILED,
        id: scannerNextId++,
        capabilities: {},
        config: {}
      }),

      _.extend(new Scanner(defaultService), {
        name: 'Cannon TS6000 Series',
        address: 'companthost',
        status: Status.PENDING,
        id: scannerNextId++,
        capabilities: {},
        config: {}
      })
    ]
  },

  getters: {
    getScannerById: state => id => state.scanners.find(scanner => scanner.id == id)
  },

  actions: {
    startSearching: function (context) {
      if (!context.state._searching) {
        bonjour().find({type: 'uscan'}, service => context.dispatch('addScanner', service))
        context.state._searching = true
      }
    },

    addScanner: function (context, service) {
      log.info('new scan service became available', service)

      let scanner = new Scanner(service)

      context.state.scanners.push(scanner)

      scanner._$http
          .get('/ScannerCapabilities', {
            responseType: 'text',
          })
          .then(response => {
            xml2js.parseString(
                response.data,
                (error, result) => {
                  if (error) {
                    log.error(`failed to parse capabilities of ${scanner.name} at ${scanner.address}`, error)

                    scanner.status = Status.FAILED
                  }
                  else {
                    readCapabilities(scanner, result, context)
                  }
                }
            )
          })
          .catch(error => {
            log.error(`failed to get capabilities of ${scanner.name} at ${scanner.address}`, error)

            scanner.status = Status.FAILED
          })
    },

    setActiveScanner: function (context, scanner) {
      context.state.activeScanner = scanner
    },

    startScanning: function (context) {
      let scanner = context.state.activeScanner
      scanner.status = Status.SCANNING

      context.dispatch('session/createNewPage', {
            width: scanner.capabilities.maxWidth,
            height: scanner.capabilities.maxHeight
          }, {root: true}
      ).then((page) => {

        log.info('starting scanning new page', page)

        progress(request({
          uri: 'https://picsum.photos/1500/2064/?random',
          timeout: 20000
        }), {
          // throttle: 100,                    // Throttle the progress event to 2000ms, defaults to 1000ms
          // delay: 1000,                       // Only start to emit after 1000ms delay, defaults to 0ms
          // lengthHeader: 'x-transfer-length'  // Length header to use, defaults to content-length
        })
            .on('progress', (state) => {
              log.debug('scan progress', state)

              context.dispatch('session/updatePageProgress', {
                    pageId: page.id,
                    percent: state.percent * 100
                  }, {root: true}
              )
            })

            .on('error', (err) => {
              log.error('error while communicating with scanner', scanner, err)

              context.dispatch('session/failPageScan', page, {root: true})

              scanner.status = Status.READY
            })

            .on('end', () => {
              log.info('successfully scanned', page)

              context.dispatch('session/updatePageProgress', {
                    pageId: page.id,
                    percent: 100
                  }, {root: true}
              )

              scanner.status = Status.READY
            })

            .pipe(fs.createWriteStream(page.fileName))
      })
    },

    updateScannerConfig(context, scanner, newConfig) {
      updateScannerConfig(scanner, newConfig)
    }
  }
}
import bonjour from 'bonjour'
import axios from 'axios'
import xml2js from 'xml2js'
import log from 'electron-log'
import CapabilitiesReader from './_capabilities-reader'
import {NEW_SCANNER, SCANNER_UPDATED} from '../scanners/scanners-mutations'
import fs from 'fs'
import request from 'request'
import progress from 'request-progress'
import store from '../store/store'

let Status = {
  PENDING: 1,
  FAILED: 2,
  READY: 3,
  SCANNING: 4
}

let scannerNextId = 42
let scanners = []

let Scanner = function (name, address, host, port) {
  this.name = name
  this.address = address
  this.status = Status.PENDING
  this.id = scannerNextId.toString()
  this.config = {}
  this.capabilities = {}
  scannerNextId++
  scanners[this.id] = this

  let $http = axios.create({
    baseURL: 'http://' + host + ':' + port + '/eSCL',
    timeout: 20000
  })

  scannersStore.commit(NEW_SCANNER, this)

  let readCapabilities = rawCapabilities => {
    let capabilities = {
      colorModes: [],
      resolutions: []
    }

    if (new CapabilitiesReader(rawCapabilities, this)
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

      this.status = Status.READY
      this.capabilities = capabilities

      log.info('retrieved capabilities for scanner:', JSON.stringify(this))
    }
    else {
      this.status = Status.FAILED
    }
  }

  $http
      .get('/ScannerCapabilities', {
        responseType: 'text',
      })
      .then(response => {
        xml2js.parseString(
            response.data,
            (error, result) => {
              if (error) {
                log.error(`failed to parse capabilities of ${this.name} at ${this.address}`, error)

                this.status = Status.FAILED
              }
              else {
                readCapabilities(result)
              }

              store.commit(`scanners/${SCANNER_UPDATED}`, {
                scannerId: this.id,
                changeSet: {
                  status: this.status,
                  capabilities: this.capabilities
                }
              })
            }
        )
      })
      .catch(error => {
        log.error(`failed to get capabilities of ${this.name} at ${this.address}`, error)

        this.status = Status.FAILED
        store.commit(`scanners/${SCANNER_UPDATED}`, {
          scannerId: this.id,
          changeSet: {
            status: this.status
          }
        })
      })

  this.startScanning = function () {
    this.status = Status.SCANNING
  }
}

function _onServiceFound(service) {
  log.info('new scan service became available', service)
  new Scanner(service.txt.ty, service.addresses.join(', '), service.host, service.port)
}

let initialized = false

function startSearching() {
  if (!initialized) {
    bonjour().find({type: 'uscan'}, _onServiceFound)
    initialized = true
  }
}

function getById(id) {
  return scanners[id]
}

export default {
  startSearching: startSearching,
  Status: Status,
  getById: getById
}

// todo remove
//
// setTimeout(() => {
//   store.commit(NEW_SCANNER, {
//     name: 'Cannon TS9080 Series - Pending',
//     address: '192.168.1.1',
//     status: Status.PENDING,
//     id: scannerNextId++,
//     capabilities: {},
//     config: {}
//   })
// }, 2000)
//
// setTimeout(() => {
//   store.commit(NEW_SCANNER, {
//     name: 'Cannon TS9080 Series - Ready',
//     address: '192.168.1.1',
//     status: Status.READY,
//     id: scannerNextId++,
//     capabilities: {},
//     config: {}
//   })
// }, 5000)
//
// setTimeout(() => {
//   store.commit(NEW_SCANNER, {
//     name: 'Cannon TS9080 Series - Failed',
//     address: '192.168.1.1',
//     status: Status.FAILED,
//     id: scannerNextId++,
//     capabilities: {},
//     config: {}
//   })
// }, 10000)


store.commit(`scanners/${NEW_SCANNER}`, {
  name: 'Cannon TS9080 Series',
  address: '192.168.1.1',
  status: Status.PENDING,
  id: scannerNextId++,
  capabilities: {},
  config: {}
})

store.commit(`scanners/${NEW_SCANNER}`, {
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
  config: {},
  startScanning: function () {
    this.status = Status.SCANNING
    store.commit(`scanners/${SCANNER_UPDATED}`, {
      scannerId: this.id,
      changeSet: {
        status: this.status
      }
    })

    store.dispatch('session/createNewPage', {
          width: this.capabilities.maxWidth,
          height: this.capabilities.maxHeight
        }
    ).then((page) => {

      console.log(`new file ${page.fileName}`)

      progress(request('https://picsum.photos/1500/2064/?random'), {
        // throttle: 100,                    // Throttle the progress event to 2000ms, defaults to 1000ms
        // delay: 1000,                       // Only start to emit after 1000ms delay, defaults to 0ms
        // lengthHeader: 'x-transfer-length'  // Length header to use, defaults to content-length
      })
          .on('progress', (state) => {
            // The state is an object that looks like this:
            // {
            //     percent: 0.5,               // Overall percent (between 0 to 1)
            //     speed: 554732,              // The download speed in bytes/sec
            //     size: {
            //         total: 90044871,        // The total payload size in bytes
            //         transferred: 27610959   // The transferred payload size in bytes
            //     },
            //     time: {
            //         elapsed: 36.235,        // The total elapsed seconds since the start (3 decimals)
            //         remaining: 81.403       // The remaining seconds to finish (3 decimals)
            //     }
            // }
            console.log('progress', state)

            store.dispatch('session/updatePageProgress', {
                  pageId: page.id,
                  percent: state.percent * 100
                }
            )
          })
          .on('error', (err) => {
            console.log('error')
            console.log(err)

            this.status = Status.FAILED
            store.commit(`scanners/${SCANNER_UPDATED}`, {
              scannerId: this.id,
              changeSet: {
                status: this.status
              }
            })
          })
          .on('end', () => {
            console.log('progress end')

            store.dispatch('session/updatePageProgress', {
                  pageId: page.id,
                  percent: 100
                }
            )

            this.status = Status.READY
            store.commit(`scanners/${SCANNER_UPDATED}`, {
              scannerId: this.id,
              changeSet: {
                status: this.status
              }
            })
          })

          .pipe(fs.createWriteStream(page.fileName))
    })
  }
})

store.commit(`scanners/${NEW_SCANNER}`, {
  name: 'HP Test Connection Scanner New Generation',
  address: '192.168.45.170',
  status: Status.FAILED,
  id: scannerNextId++,
  capabilities: {},
  config: {}
})

store.commit(`scanners/${NEW_SCANNER}`, {
  name: 'Cannon TS6000 Series',
  address: 'companthost',
  status: Status.PENDING,
  id: scannerNextId++,
  capabilities: {},
  config: {}
})
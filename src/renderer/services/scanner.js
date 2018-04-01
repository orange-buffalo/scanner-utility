import bonjour from 'bonjour'
import axios from 'axios'
import xml2js from 'xml2js'
import log from 'electron-log'
import events from './event-bus'
import CapabilitiesReader from './_capabilities-reader'

let Status = {
  PENDING: 1,
  FAILED: 2,
  READY: 3
}

let Scanner = function (name, address, host, port) {
  this.name = name
  this.address = address
  this.status = Status.PENDING

  let $http = axios.create({
    baseURL: 'http://' + host + ':' + port + '/eSCL',
    timeout: 20000
  })

  events.emit('new-scanner', this)

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
              events.emit('scanner-update', this)
            }
        )
      })
      .catch(error => {
        log.error(`failed to get capabilities of ${this.name} at ${this.address}`, error)

        this.status = Status.FAILED
        events.emit('scanner-update', this)
      })
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

export default {
  startSearching: startSearching,
  Status: Status
}
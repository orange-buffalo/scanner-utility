import CapabilitiesReader from './_capabilities-reader'
import {Status, ScannerProvider} from '../scanner-api'
import bonjour from 'bonjour'
import axios from 'axios'
import log from 'electron-log'
import xml2js from 'xml2js'

export class eSclScannerProvider extends ScannerProvider {

  constructor(callbacks) {
    super(callbacks)

    this.scanners = []

    bonjour().find({type: 'uscan'}, service => {
      log.info('new scan service became available', service)

      let scannerOptions = {
        name: service.txt.ty,
        address: service.addresses.join(', ')
      }

      let scanner = {
        id: this.callbacks.onNewScanner(this, scannerOptions),
        _$http: axios.create({
          baseURL: 'http://' + service.host + ':' + service.port + '/eSCL',
          timeout: 20000
        }),
        options: scannerOptions
      }
      this.scanners[scanner.id] = scanner

      scanner._$http
          .get('/ScannerCapabilities', {
            responseType: 'text',
          })
          .then(response => {
            xml2js.parseString(
                response.data,
                (error, result) => {
                  if (error) {
                    log.error(`failed to parse capabilities of ${scannerOptions.name} at ${scannerOptions.address}`, error)

                    this.callbacks.onScannerStatusChange(scanner.id, Status.FAILED)
                  }
                  else {
                    this.readCapabilities(scannerOptions, result)
                  }
                }
            )
          })
          .catch(error => {
            log.error(`failed to get capabilities of ${scannerOptions.name} at ${scannerOptions.address}`, error)

            this.callbacks.onScannerStatusChange(scanner.id, Status.FAILED)
          })
    })
  }

  scanPage(scannerId, fileName, onComplete, onProgress, onFailure) {

  }

  readCapabilities(scanner, rawCapabilities) {
    let capabilities = {
      colorModes: [],
      resolutions: []
    }

    if (new CapabilitiesReader(rawCapabilities, scanner.options)
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

      this.callbacks.onCapabilitiesRetrieved(scanner.id, capabilities)
      this.callbacks.onScannerStatusChange(scanner.id, Status.READY)

      log.info('retrieved capabilities for scanner:', scanner)
    }
    else {
      this.callbacks.onScannerStatusChange(scanner.id, Status.FAILED)
    }
  }
}
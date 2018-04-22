import CapabilitiesReader from './_capabilities-reader'
import {Status, ScannerProvider} from '../scanner-api'
import axios from 'axios'
import log from 'electron-log'
import xml2js from 'xml2js'
import mdns from 'mdns-js'
import request from 'request'
import progress from 'request-progress'
import fs from 'fs'

export class eSclScannerProvider extends ScannerProvider {

  constructor(callbacks) {
    super(callbacks)

    this.scanners = []

    this.browser = mdns.createBrowser('_uscan._tcp')

    this.browser.on('ready', () => {
      this.browser.discover()
    })

    this.browser.on('update', service => {
      log.info('new scan service became available', service)

      if (!service.txt || !service.host) {
        log.info('skipping as essential info is missing')
        return
      }

      if (this.scanners.find(scanner => scanner.host == service.host)) {
        log.info('already registered %s', service.host)
        return
      }

      let scannerOptions = {
        name: service.txt.find(txt => txt.startsWith('ty=')).replace('ty=', ''),
        address: service.addresses.join(', ')
      }

      let scanner = {
        id: this.callbacks.onNewScanner(this, scannerOptions),
        _$http: axios.create({
          baseURL: 'http://' + service.host + ':' + service.port + '/eSCL',
          timeout: 20000
        }),
        options: scannerOptions,
        host: service.host
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
                    this.readCapabilities(scanner, result)
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

  scanPage(scannerId, config, fileName, onComplete, onProgress, onFailure) {
    let scanner = this.scanners[scannerId]

    log.info('requested scan for %s', scanner.host)

    let scanRequest = {
      'scan:ScanSettings': {
        '$': {
          'xmlns:pwg': 'http://www.pwg.org/schemas/2010/12/sm',
          'xmlns:scan': 'http://schemas.hp.com/imaging/escl/2011/05/03',
        },
        'pwg:Version': '2.6',
        'pwg:ScanRegions': {
          'pwg:ScanRegion': {
            'pwg:Height': scanner.capabilities.maxHeight,
            'pwg:ContentRegionUnits': 'escl:ThreeHundredthsOfInches',
            'pwg:Width': scanner.capabilities.maxWidth,
            'pwg:XOffset': '0',
            'pwg:YOffset': '0'
          }
        },
        'pwg:InputSource': 'Platen',
        'scan:ColorMode': config.colorMode.name,
        'pwg:DocumentFormat': 'image/jpeg',
        'scan:XResolution': config.resolution.value,
        'scan:YResolution': config.resolution.value
      }
    }
    let scanRequestXml = new xml2js.Builder().buildObject(scanRequest)

    log.debug('preparing to send %s', scanRequestXml)

    scanner._$http.post('/ScanJobs', scanRequestXml, {
      responseType: 'text',

    }).then(function (response) {
      if (response.status != 201) {
        onFailure(response)
        return
      }

      let jobLocation = response.headers.location

      log.info('scheduled scan job %s', jobLocation)

      progress(request({
            uri: `${jobLocation}/NextDocument`,
            timeout: 10000

          }, (error, response) => {
            if (error) {
              onFailure(error)
            }
            else if (response.statusCode != 200) {
              onFailure(response)
            }
            else {
              onComplete()
            }
          })
      ).on('progress', (state) => {
        onProgress(state.percent * 100)

      }).pipe(fs.createWriteStream(fileName))

    }).catch(error => onFailure(error))
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
      scanner.capabilities = capabilities

      log.info('retrieved capabilities for scanner:', scanner)
    }
    else {
      this.callbacks.onScannerStatusChange(scanner.id, Status.FAILED)
    }
  }
}
import {ScannerProvider, Status} from '../scanner-api'
import fs from 'fs'
import request from 'request'
import progress from 'request-progress'

export class DevScannerProvider extends ScannerProvider {

  constructor(callbacks) {
    super(callbacks)

    this.callbacks.onNewScanner(this, {
      name: 'Pending T6483J Series Scanner',
      address: '192.168.1.1'
    })

    let scannerId = this.callbacks.onNewScanner(this, {
      name: 'Cannon PIXMA MG7550 Series - For Tests',
      address: '192.168.1.170'
    })
    this.callbacks.onCapabilitiesRetrieved(scannerId, {
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
    })
    this.callbacks.onScannerStatusChange(scannerId, Status.READY)

    scannerId = this.callbacks.onNewScanner(this, {
      name: 'HP Test Connection Scanner New Generation',
      address: '192.168.45.170'
    })
    this.callbacks.onScannerStatusChange(scannerId, Status.FAILED)

    this.callbacks.onNewScanner(this, {
      name: 'Cannon TS6000 Series',
      address: 'companyhost'
    })
  }

  scanPage(scannerId, config, onComplete, onProgress, onFailure) {
    progress(request({
      uri: 'https://picsum.photos/1500/2064/?random',
      timeout: 10000
    }), {
      // throttle: 100,                    // Throttle the progress event to 2000ms, defaults to 1000ms
      // delay: 1000,                       // Only start to emit after 1000ms delay, defaults to 0ms
      // lengthHeader: 'x-transfer-length'  // Length header to use, defaults to content-length
    })
        .on('progress', (state) => {
          onProgress(state.percent * 100)
        })

        .on('error', (err) => {
          onFailure(err)
        })

        .on('end', () => {
          onComplete()
        })

        .pipe(fs.createWriteStream(config.fileName))
  }
}
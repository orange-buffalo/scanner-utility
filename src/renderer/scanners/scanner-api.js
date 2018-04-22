export let Status = {
  PENDING: 1,
  FAILED: 2,
  READY: 3,
  SCANNING: 4
}

export class ScannerProvider {

  /**
   * @param callbacks a set of callbacks to identify creator about important lifecycle events.
   * Will provide the following callback:
   *
   * onNewScanner(provider, options) - to be called when new scanner is found. options must provide the name and address for
   * information purposes. Callback will return the ID of new scanner.
   * New scanner will be created with empty capabilities and with PENDING status.
   *
   * onScannerStatusChange(scannerId, status) - to be called when scanner's status is changed (to READY or FAILED)
   *
   * onCapabilitiesRetrieved(scannerId, capabilities) - to be called when scanner's capabilities are known. Will update the
   * scanner so that it can be configured according to supported capabilities.
   *
   */
  constructor(callbacks) {
    this.callbacks = callbacks
  }

  /**
   * Initiates scanning for scanner identified by id. Provided callbacks must be called in order to update the scanning
   * progress and results.
   * @param scannerId scanner to start scanning for.
   * @param config scanner configuration, including scanner capabilities config and
   * full path to the JPEG file that is to be populated during scanning.
   * @param onComplete = function(): to be called upon successful completion of page scanning.
   * @param onProgress = function(percent): to be called during scanning to indicate the progress. null percent means
   * there is scanning ongoing but it is not possible to determine the completeness percent.
   * @param onFailure = function(error): to be called if scanning failed.
   */
  scanPage(scannerId, config, onComplete, onProgress, onFailure) {
    // no op
  }

}
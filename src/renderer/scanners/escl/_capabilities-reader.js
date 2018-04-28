import log from 'electron-log'

let CapabilitiesReader = function (rawCapabilities, scannerOptions, parent) {
  let elementsStack = [rawCapabilities]
  let valid = true

  this._invalidate = () => {
    valid = false
    if (parent) {
      parent._invalidate()
    }
  }

  let _executeStepIfValid = step => {
    if (valid) {
      step()
    }
    return this
  }

  this.mandatoryElement = elementName => {
    return _executeStepIfValid(() => {
      let currentElement = elementsStack[elementsStack.length - 1]
      let requestedElement = currentElement[elementName]
      if (!requestedElement) {
        log.error(`failed to parse capabilities of ${scannerOptions.name} at ${scannerOptions.address}, 
                   missing element ${elementName} in %j`, rawCapabilities)

        this._invalidate()
        return
      }

      if (requestedElement instanceof Array) {
        if (requestedElement.length !== 1) {
          log.error(`failed to parse capabilities of ${scannerOptions.name} at ${scannerOptions.address}, 
                      element ${elementName} should be met exactly once in %j`, rawCapabilities)

          this._invalidate()
          return
        }
        else {
          requestedElement = requestedElement[0]
        }
      }
      elementsStack.push(requestedElement)
    })
  }

  this.mandatoryElements = elementName => {
    return _executeStepIfValid(() => {
      let currentElement = elementsStack[elementsStack.length - 1]
      let requestedElement = currentElement[elementName]
      if (!requestedElement) {
        log.error(`failed to parse capabilities of ${scannerOptions.name} at ${scannerOptions.address}, 
                    missing element ${elementName} in %j`, rawCapabilities)

        this._invalidate()
        return
      }

      if (requestedElement instanceof Array) {
        elementsStack.push(requestedElement)
      }
      else {
        log.error(`failed to parse capabilities of ${scannerOptions.name} at ${scannerOptions.address}, 
                element ${elementName} should be an array in %j`, rawCapabilities)

        this._invalidate()
      }
    })
  }

  let _readOneElement = (element, consumer) => {
    if (typeof element === 'string' || element instanceof String) {
      consumer(element, false)
    }
    else if (element.$) {
      consumer(element._, element.$['scan:default'] == 'true')
    }
    else {
      log.error(`failed to parse capabilities of ${scannerOptions.name} at ${scannerOptions.address}, 
               element ${element} is not a single text element in %j`, rawCapabilities)

      this._invalidate()
    }
  }

  this.readElement = consumer => {
    return _executeStepIfValid(() => {
      let currentElement = elementsStack[elementsStack.length - 1]
      if (currentElement instanceof Array) {
        currentElement.forEach(element => {
          _readOneElement(element, consumer)
        })
      }
      else {
        _readOneElement(currentElement, consumer)
      }
    })
  }

  this.up = () => {
    return _executeStepIfValid(() => {
      elementsStack.pop()
    })
  }

  this.forEach = consumer => {
    return _executeStepIfValid(() => {
      let currentElement = elementsStack[elementsStack.length - 1]
      if (currentElement instanceof Array) {
        currentElement.forEach(element => {
          consumer(new CapabilitiesReader(element, scannerOptions))
        })
      }
      else {
        log.error(`failed to parse capabilities of ${scannerOptions.name} at ${scannerOptions.address},
                element ${currentElement} should be an array in %j`, rawCapabilities)

        this._invalidate()
      }
    })
  }

  this.isValid = () => {
    return valid
  }
}

export default CapabilitiesReader
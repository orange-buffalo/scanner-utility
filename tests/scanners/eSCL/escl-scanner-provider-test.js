import {expect, assert} from 'chai'
import sinon from 'sinon'
import proxyquire from 'proxyquire'
import fs from 'fs'
import moxios from 'moxios'
import {Status} from "../../../src/renderer/scanners/scanner-api"

let sandbox = sinon.createSandbox()

describe('esclScannerProvider', () => {

  beforeEach(() => {
    moxios.install()
  })

  afterEach(() => {
    sandbox.restore()
    moxios.uninstall()
  })

  it('should start autoconfig with proper config', done => {
    let mdns = {
      createBrowser: sandbox.stub().returns({on: sandbox.stub()})
    }
    _createProviderWithMdns(mdns)

    assert(mdns.createBrowser.calledWithMatch('_uscan._tcp'), 'autoconfig is not called properly')

    done()
  })

  it('should subscribe to browser events', done => {
    let browser = {
      on: sinon.stub(),
      discover: sinon.stub()
    }
    _createProvider(browser)

    assert(browser.on.calledTwice, 'should subscribe to two events')
    expect(browser.on.getCall(0).args[0]).to.be.equal('ready')
    expect(browser.on.getCall(1).args[0]).to.be.equal('update')
    assert(browser.discover.notCalled, 'discover should not be called before callback is invokes for ready event')

    browser.on.getCall(0).args[1]()

    assert(browser.discover.calledOnce, 'discover should be called via ready callback')

    done()
  })

  it('should not create new scanner if important information is missing', done => {
    let callbacks = {
      onNewScanner: sinon.stub()
    }
    _createProviderAndUpdate(callbacks, {})

    assert(callbacks.onNewScanner.notCalled, 'should not call new page callback for empty service')

    done()
  })

  it('should request a new scanner when service is valid', done => {
    let callbacks = {
      onNewScanner: sinon.stub()
    }
    let provider = _createProviderAndUpdate(callbacks, {
      host: 'test-host',
      txt: [
        'nonsense=bullshit',
        'noise=nothing',
        'ty=test-name',
        'another=trash'
      ],
      addresses: [
        'addr1',
        'addr2'
      ]
    })

    assert(callbacks.onNewScanner.calledOnce, 'should request a new scanner creation')
    expect(callbacks.onNewScanner.args[0][0]).to.be.equal(provider)
    expect(callbacks.onNewScanner.args[0][1]).to.deep.include({
      name: 'test-name',
      address: 'addr1, addr2'
    })

    done()
  })

  it('should not request a new scanner twice for the same host', done => {
    let callbacks = {
      onNewScanner: sinon.stub()
    }
    let browser = {
      on: sinon.stub(),
      discover: sinon.stub()
    }

    _createProvider(browser, callbacks)

    browser.on.getCall(1).args[1]({
      host: 'test-host',
      txt: ['ty=test-name'],
      addresses: ['addr1']
    })

    browser.on.getCall(1).args[1]({
      host: 'test-host',
      txt: ['ty=another-name'],
      addresses: ['addr2']
    })

    assert(callbacks.onNewScanner.calledOnce, 'should request a new scanner only once for the host')

    done()
  })

  it('should emit scanner fail event when scan capabilities request fails', done => {
    let callbacks = {
      onNewScanner: sinon.stub().returns(42),
      onScannerStatusChange: sinon.stub()
    }
    _createProviderAndUpdate(callbacks, {
      host: 'test-host',
      txt: ['ty=test-name'],
      addresses: ['addr1']
    })

    moxios.wait(function () {
      let request = moxios.requests.mostRecent()
      request.respondWith({
        status: 404
      }).then(() => {

        assert(callbacks.onScannerStatusChange.calledOnce, 'should update status on failure')
        expect(callbacks.onScannerStatusChange.args[0][0]).to.be.equal(42)
        expect(callbacks.onScannerStatusChange.args[0][1]).to.be.equal(Status.FAILED)

        done()
      })
    })
  })

  it('should update scanner capabilities when scan capabilities request succeeded', done => {
    let callbacks = {
      onNewScanner: sinon.stub().returns(42),
      onScannerStatusChange: sinon.stub(),
      onCapabilitiesRetrieved: sinon.stub()
    }
    _createProviderAndUpdate(callbacks, {
      host: 'test-host',
      txt: ['ty=test-name'],
      addresses: ['addr1'],
      port: 88
    })

    moxios.wait(function () {
      let request = moxios.requests.mostRecent()

      expect(request.url).to.equal('http://test-host:88/eSCL/ScannerCapabilities')
      expect(request.config.method).to.equal('get')

      request
          .respondWith({
            status: 200,
            response: fs.readFileSync(__dirname + '/scanner-capabilities.xml', 'utf8')
          })
          .then(() => {
            assert(callbacks.onScannerStatusChange.calledOnce, 'should update status on capabilities read')
            expect(callbacks.onScannerStatusChange.args[0][0]).to.be.equal(42)
            expect(callbacks.onScannerStatusChange.args[0][1]).to.be.equal(Status.READY)

            assert(callbacks.onCapabilitiesRetrieved.calledOnce, 'should update capabilities')
            expect(callbacks.onCapabilitiesRetrieved.args[0][0]).to.be.equal(42)
            expect(callbacks.onCapabilitiesRetrieved.args[0][1]).to.nested.include({
              'maxWidth': '2550',
              'maxHeight': '3508',
              'colorModes[0].name': 'Grayscale8',
              'colorModes[0].isDefault': false,
              'colorModes[1].name': 'RGB24',
              'colorModes[1].isDefault': true,
              'resolutions[0].value': '75',
              'resolutions[0].isDefault': false,
              'resolutions[1].value': '100',
              'resolutions[1].isDefault': false,
              'resolutions[2].value': '300',
              'resolutions[2].isDefault': true,
              'resolutions[3].value': '600',
              'resolutions[3].isDefault': false
            })

            done()
          })
    })
  })

  function _createProviderAndUpdate(callbacks, inputService) {
    let browser = {
      on: sinon.stub(),
      discover: sinon.stub()
    }
    let provider = _createProvider(browser, callbacks)
    browser.on.getCall(1).args[1](inputService)
    return provider
  }

  function _createProvider(browser, callbacks) {
    let mdns = {
      createBrowser: sandbox.stub().returns(browser)
    }
    return _createProviderWithMdns(mdns, callbacks)
  }

  function _createProviderWithMdns(mdns, callbacks) {
    let eSclScannerProviderModule = proxyquire('../../../src/renderer/scanners/escl/escl-scanner-provider.js', {
      'mdns-js': mdns,
    })

    return new eSclScannerProviderModule.eSclScannerProvider(callbacks)
  }
})
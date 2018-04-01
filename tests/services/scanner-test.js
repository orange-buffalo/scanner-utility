import {expect, assert} from 'chai'
import sinon from 'sinon'
import proxyquire from 'proxyquire'
import fs from 'fs'
import events from '../../src/renderer/services/event-bus'
import moxios from 'moxios'

let sandbox = sinon.createSandbox()

describe('scanner', () => {
  let scanner
  let bonjour

  beforeEach(() => {
    bonjour = {
      find: sandbox.stub()
    }
    let bonjourModule = sandbox.stub().returns(bonjour)

    scanner = proxyquire('../../src/renderer/services/scanner.js', {
      'bonjour': bonjourModule,
    }).default

    moxios.install()
  })

  afterEach(() => {
    sandbox.restore()
    moxios.uninstall()
  })

  it('should start autoconfig with proper config', done => {
    scanner.startSearching()

    assert(bonjour.find.calledWithMatch({type: 'uscan'}), 'autoconfig is not called properly')

    done()
  })

  it('should create a pending scanner when new service found', done => {
    let actualScanner
    events.on('new-scanner', s => actualScanner = s)

    _initScanner()

    assert(actualScanner, 'new-scanner event should be emitted with a new scanner')

    expect(actualScanner).to.deep.include({
      name: 'Canon TS9000 series',
      address: 'ip-address',
      status: scanner.Status.PENDING
    })

    done()
  })

  it('should emit scanner-update event when scan capabilities request fails', done => {
    let actualScanner
    events.on('scanner-update', s => actualScanner = s)

    _initScanner()

    moxios.wait(function () {
      let request = moxios.requests.mostRecent()
      request.respondWith({
        status: 404
      }).then(() => {
        assert(actualScanner, 'scanner-update event should be emitted with an updated scanner')

        expect(actualScanner).to.deep.include({
          status: scanner.Status.FAILED
        })

        done()
      })
    })
  })

  it('should emit scanner-update event when scan capabilities request succeeded', done => {
    let actualScanner
    events.on('scanner-update', s => actualScanner = s)

    _initScanner()

    moxios.wait(function () {
      let request = moxios.requests.mostRecent()

      expect(request.url).to.equal('http://scanner-host:80/eSCL/ScannerCapabilities')
      expect(request.config.method).to.equal('get')

      request
          .respondWith({
            status: 200,
            response: fs.readFileSync(__dirname + '/scanner-capabilities.xml', 'utf8')
          })
          .then(() => {
            assert(actualScanner, 'scanner-update event should be emitted with an updated scanner')

            expect(actualScanner).to.nested.include({
              'status': scanner.Status.READY,
              'capabilities.maxWidth': '2550',
              'capabilities.maxHeight': '3508',
              'capabilities.colorModes[0].name': 'Grayscale8',
              'capabilities.colorModes[0].isDefault': false,
              'capabilities.colorModes[1].name': 'RGB24',
              'capabilities.colorModes[1].isDefault': true,
              'capabilities.resolutions[0].value': '75',
              'capabilities.resolutions[0].isDefault': false,
              'capabilities.resolutions[1].value': '100',
              'capabilities.resolutions[1].isDefault': false,
              'capabilities.resolutions[2].value': '300',
              'capabilities.resolutions[2].isDefault': true,
              'capabilities.resolutions[3].value': '600',
              'capabilities.resolutions[3].isDefault': false
            })

            done()
          })
    })
  })

  function _initScanner() {
    scanner.startSearching()

    assert(bonjour.find.calledOnce, 'autoconfig is not called')

    let serviceFindCallback = bonjour.find.args[0][1]
    assert(serviceFindCallback, 'callback must be provided for a service lookup')

    serviceFindCallback.call(serviceFindCallback,
        JSON.parse(fs.readFileSync(__dirname + '/autoconfig-response.json', 'utf8')))
  }
})
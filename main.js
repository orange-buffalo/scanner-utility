const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')
const scanner = require('./app/js/services/scanner');
var log = require('electron-log');

const eventBus = require('events');

log.transports.file.level = false;

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({width: 800, height: 600})

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'app/index.html'),
    protocol: 'file:',
    slashes: true
  }))
}

app.on('ready', createWindow);

// eventBus.addEventListener('new-scanner', function (event, scanner) {
//    console.log("tada:", scanner)
// });

scanner.startSearching();

// bonjour.find({type: 'uscan'}, function (service) {
//   // console.log('Found an HTTP server:', service)
//
//   var baseUrl = 'http://' + service.host + ':' + service.port + '/eSCL';
//
//   var a = axios.create({
//     baseURL: baseUrl,
//     timeout: 15000
//   });
//   //
//   // console.log(a);
//   // a.defaults.baseURL = baseUrl;
//
//   a.get(baseUrl + '/ScannerCapabilities', {
//     responseType: 'text',
//   }).then(function (response) {
//     // console.log(response.data);
//
//     xml2js.parseString(
//          response.data,
//          {
//            tagNameProcessors: [xml2js.processors.stripPrefix]
//          },
//          function (err, result) {
//            // result['ScannerCapabilities']['Platen'][0]['PlatenInputCaps'][0]
//          }
//     );
//
//
//     // var doc = new dom().parseFromString(response.data);
//     // var select = xpath.useNamespaces({"scan": "http://schemas.hp.com/imaging/escl/2011/05/03"});
//     // var title = select("//scan:ScannerCapabilities/scan:AdminURI/text()", doc)[0].nodeValue;
//     //
//     // console.log(title);
//     //
//     //
//     // console.log('----');
//     // // console.log(response.status);
//     // // console.log(response.statusText);
//     // // console.log(response.headers);
//     // // console.log(response.config);
//     //
//
//
//     var feedObj = {
//       'scan:ScanSettings': {
//         '$': {
//           'xmlns:pwg': 'http://www.pwg.org/schemas/2010/12/sm',
//           'xmlns:scan': 'http://schemas.hp.com/imaging/escl/2011/05/03',
//         },
//
//         'pwg:Version': '2.6',
//         'pwg:ScanRegions': {
//           'pwg:ScanRegion': {
//             'pwg:Height': '3508',
//             'pwg:ContentRegionUnits': 'escl:ThreeHundredthsOfInches',
//             'pwg:Width': '2550',
//             'pwg:XOffset': '0',
//             'pwg:YOffset': '0',
//           }
//         },
//         'pwg:InputSource': 'Platen',
//         // 'pwg:ColorMode': 'RGB24',
//         'pwg:DocumentFormat': 'application/pdf',
//         // 'pwg:DiscreteResolution': {
//         'scan:XResolution': '1200',
//         'scan:YResolution': '1200',
//         // },
//       }
//     }
//     var builder = new xml2js.Builder();
//     var xml = builder.buildObject(feedObj);
//
//
//     console.log(xml);
//     //
//     // a.post(baseUrl + '/ScanJobs',message, {
//     //   responseType: 'text',
//     //
//     // }).then(function (response) {
//     //   let message2 = response.headers.location;
//     //   console.log(message2)
//     //   // console.log(response.data)
//     //
//     //
//     // });
//
//   });
//
// })



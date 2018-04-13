import {CREATE_NEW_PAGE, SAVE_AS_PDF, UPDATE_PAGE_PROGRESS} from './session-mutations'

const {app, dialog, getCurrentWindow} = require('electron').remote
import fs from 'fs'
import PDFDocument from 'pdfkit'

function createNewJpgFile() {
  let dir = `${app.getPath('userData')}/session/`
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }
  return `${dir}/${new Date().getTime()}.jpg`
}

let pageNextId = 42

class ScanPage {

  constructor(width, height) {
    this.id = pageNextId++
    this.fileName = createNewJpgFile()
    this.width = width
    this.height = height
    this.hasData = false
    this._update(null)
  }

  _update = function (percentLoaded) {
    this.percentLoaded = percentLoaded
    this.url = `file:///${this.fileName}?nocache=${new Date().getMilliseconds()}`
  }

}

let sessionStore = {
  state: {
    pages: []
  },

  mutations: {
    [CREATE_NEW_PAGE](state, page) {
      state.pages.push(page)
    },

    [UPDATE_PAGE_PROGRESS](state, payload) {
      payload.page._update(payload.percent)
    },

    [SAVE_AS_PDF](state, payload) {
      // let scannerIndex = state.scanners.findIndex(scanner => scanner.id == payload.scannerId)
      // let scanner = state.scanners[scannerIndex]
      // scanner.config = payload.config
    },

  },

  getters: {
    getPageById: (state) => (id) => {
      return state.pages.find(page => page.id == id)
    }
  },

  actions: {
    createNewPage(context, payload) {
      return new Promise((resolve) => {
        let scanPage = new ScanPage(payload.width, payload.height)
        context.commit(CREATE_NEW_PAGE, scanPage)
        resolve(scanPage)
      })
    },

    updatePageProgress(context, payload) {
      context.commit(UPDATE_PAGE_PROGRESS, {
        page: context.getters.getPageById(payload.pageId),
        percent: payload.percent
      })
    },

    saveAsPdf(context) {
      let fileName = dialog.showSaveDialog(
          getCurrentWindow(), {
            filters: [{extensions: ['.pdf']}]
          })

      if (fileName) {
        let doc = new PDFDocument({autoFirstPage: false})

        doc.pipe(fs.createWriteStream(fileName))

        context.state.pages.forEach((page) => {
          doc.addPage({margin: 0, size: 'A4'})  // todo layout: 'landscape'
              .image(page.fileName, 0, 0,
                  {width: doc.page.width, height: doc.page.height})
        })

        doc.end()
      }
    }
  }
}

export default sessionStore

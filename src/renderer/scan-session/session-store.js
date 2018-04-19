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

function updatePage(page, percentLoaded) {
  page.percentLoaded = percentLoaded
  page.url = `file:///${page.fileName}?nocache=${new Date().getMilliseconds()}`
  page.ready = percentLoaded == 100

  try {
    let fileStats = fs.statSync(page.fileName)
    page.fileSizeInBytes = fileStats["size"]
  } catch (err) {
    // no op
  }

  page.hasData = page.fileSizeInBytes > 0
}

let pageNextId = 42

let sessionStore = {
  state: {
    pages: []
  },

  getters: {
    getPageById: state => id => state.pages.find(page => page.id == id)
  },

  actions: {
    createNewPage(context, payload) {
      return new Promise((resolve) => {
        let scanPage = {
          id: pageNextId++,
          fileName: createNewJpgFile(),
          width: payload.width,
          height: payload.height,
          hasData: false,
          ready: false,
          error: false,
          fileSizeInBytes: 0
        }
        updatePage(scanPage, null)
        context.state.pages.push(scanPage)
        resolve(scanPage)
      })
    },

    updatePageProgress(context, payload) {
      updatePage(context.getters.getPageById(payload.pageId), payload.percent)
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
    },

    failPageScan(context, page) {
      page.error = true
      page.ready = true
    },

    deletePage(context, page) {
      let index = context.state.pages.findIndex(p => page.id == p.id)
      context.state.pages.splice(index, 1)
    }
  }
}

export default sessionStore

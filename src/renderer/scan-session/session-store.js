const {app, dialog, getCurrentWindow} = require('electron').remote
import fs from 'fs'
import PDFDocument from 'pdfkit'
import log from 'electron-log'
import sharp from 'sharp'

function createNewJpgFile() {
  let dir = `${app.getPath('userData')}/session/`
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }
  return `${dir}/${new Date().getTime()}.jpg`
}

function updatePageUrl(page) {
  page.url = `file:///${page.fileName}?nocache=${new Date().getMilliseconds()}`
}

function updatePage(page, percentLoaded) {
  page.percentLoaded = percentLoaded
  page.ready = percentLoaded == 100

  try {
    let fileStats = fs.statSync(page.fileName)
    page.fileSizeInBytes = fileStats["size"]
  } catch (err) {
    // no op
  }

  page.hasData = page.fileSizeInBytes > 0

  updatePageUrl(page)
}

let pageNextId = 42

let sessionStore = {
  state: {
    pages: [],
    saved: false,
    pdfFileName: null
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

    savePdf(context) {
      if (!context.state.pdfFileName) {
        log.error('file name is not defined to save pdf file')
        return
      }

      let doc = new PDFDocument({autoFirstPage: false})

      doc.pipe(fs.createWriteStream(context.state.pdfFileName))

      context.state.pages.forEach((page) => {
        doc.addPage({margin: 0, size: 'A4'})  // todo layout: 'landscape'
            .image(page.fileName, 0, 0,
                {width: doc.page.width, height: doc.page.height})
      })

      doc.end()
    },

    saveAsPdf(context) {
      let fileName = dialog.showSaveDialog(
          getCurrentWindow(), {
            filters: [{extensions: ['.pdf']}]
          })

      if (fileName) {
        context.state.pdfFileName = fileName
        context.dispatch('savePdf')
      }
    },

    failPageScan(context, page) {
      page.error = true
      page.ready = true
    },

    deletePage(context, page) {
      let index = context.state.pages.findIndex(p => page.id == p.id)
      context.state.pages.splice(index, 1)
    },

    rotatePage(context, pageId) {
      let page = context.getters.getPageById(pageId)
      let newFile = createNewJpgFile()
      sharp(page.fileName)
          .rotate(90)
          .toFile(newFile)
          .then(() => {

            let oldWidth = page.width
            // noinspection JSSuspiciousNameCombination
            page.width = page.height
            // noinspection JSSuspiciousNameCombination
            page.height = oldWidth

            fs.unlinkSync(page.fileName)
            page.fileName = newFile
            updatePageUrl(page)

            log.info('rotated %j', page)
          })
          .catch(err => {
            log.error('failed to rotate image %s: %j', page.fileName, err)
            fs.unlinkSync(newFile)
          })
    }
  }
}

export default sessionStore

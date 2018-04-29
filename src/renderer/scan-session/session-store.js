const {app, dialog, getCurrentWindow} = require('electron').remote
import fs from 'fs'
import PDFDocument from 'pdfkit'
import log from 'electron-log'
import sharp from 'sharp'
import prettyBytes from 'pretty-bytes'

let sessionStorePath = `${app.getPath('userData')}/session/`
if (!fs.existsSync(sessionStorePath)) {
  fs.mkdirSync(sessionStorePath)
}

let pageNextId = 42

class Page {
  constructor(fileName, width, height) {
    this.id = pageNextId++
    this.fileName = fileName
    this.width = width
    this.height = height
    this.hasData = false
    this.ready = false
    this.error = false
    this.fileSizeInBytes = 0
  }
}

function createNewJpgFile() {
  return `${sessionStorePath}/${new Date().getTime()}.jpg`
}

function updatePageUrl(page) {
  page.url = `file:///${page.fileName}?nocache=${new Date().getTime()}`
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

function getExistingPages() {
  let pages = []
  fs.readdirSync(sessionStorePath).forEach(shortFileName => {
    let fileName = `${sessionStorePath}${shortFileName}`
    log.info('found existing page in session: %s', fileName)

    if (fileName.toLowerCase().endsWith('.jpg')) {
      let fileStats = fs.statSync(fileName)
      let fileSizeInBytes = fileStats["size"]
      if (fileSizeInBytes == 0) {
        fs.unlinkSync(fileName)

        log.info('removed zero-sized jpeg: %s', fileName)
      }
      else {
        sharp(fileName)
            .metadata()
            .then(info => {
              let page = new Page(
                  fileName,
                  info.width,
                  info.height
              )
              pages.push(page)
              updatePage(page, 100)

              log.info('loaded page %j', page)
            })
            .catch(err => {
              log.warn('cannot read metadata for %s: %j', fileName, err)
            })
      }
    }
  })
  return pages
}

let sessionStore = {
  state: {
    pages: getExistingPages(),
    pdfFileName: null,
    allChangesSaved: true
  },

  getters: {
    getPageById: state => id => state.pages.find(page => page.id == id),

    getPageIndexById: state => id => state.pages.findIndex(page => page.id == id),

    getSessionInfo: state => {
      let totalPagesSizeInBytes = 0
      state.pages.forEach(page => {
        if (page.ready) {
          totalPagesSizeInBytes += page.fileSizeInBytes
        }
      })

      return {
        fileName: state.fileName,
        pagesCount: state.pages.length,
        totalSize: prettyBytes(totalPagesSizeInBytes),
        allChangesSaved: state.allChangesSaved
      }
    }
  },

  actions: {
    createNewPage(context, payload) {
      return new Promise((resolve) => {
        let scanPage = new Page(
            createNewJpgFile(),
            payload.width,
            payload.height
        )
        updatePage(scanPage, null)
        context.state.pages.push(scanPage)
        context.state.allChangesSaved = false
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
        doc.addPage({
          margin: 0,
          size: 'A4',
          layout: page.width > page.height ? 'landscape' : 'portrait'

        }).image(page.fileName, 0, 0,
            {width: doc.page.width, height: doc.page.height})
      })

      doc.end()

      context.state.allChangesSaved = true
    },

    saveAsPdf(context) {
      return new Promise((resolve, reject) => {
        let fileName = dialog.showSaveDialog(
            getCurrentWindow(), {
              filters: [{
                name: 'Adobe PDF',
                extensions: ['pdf']
              }]
            })

        if (fileName) {
          context.state.pdfFileName = fileName
          context.dispatch('savePdf')
          resolve()
        }
        else {
          reject()
        }
      })
    },

    failPageScan(context, page) {
      page.error = true
      page.ready = true
    },

    deletePage(context, pageId) {
      let index = context.getters.getPageIndexById(pageId)
      let page = context.state.pages.splice(index, 1)[0]
      fs.unlinkSync(page.fileName)
      context.state.allChangesSaved = false

      log.info('removed %j', page)
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

            context.state.allChangesSaved = false

            log.info('rotated %j', page)
          })
          .catch(err => {
            log.error('failed to rotate image %s: %j', page.fileName, err)
            fs.unlinkSync(newFile)
          })
    },

    movePageBackward(context, pageId) {
      let index = context.getters.getPageIndexById(pageId)
      if (index > 0) {
        let p = context.state.pages.splice(index, 1, context.state.pages[index - 1])
        context.state.pages.splice(index - 1, 1, p[0])

        context.state.allChangesSaved = false
      }
    },

    movePageForward(context, pageId) {
      let index = context.getters.getPageIndexById(pageId)
      if (index < context.state.pages.length - 1) {
        let p = context.state.pages.splice(index, 1, context.state.pages[index + 1])
        context.state.pages.splice(index + 1, 1, p[0])

        context.state.allChangesSaved = false
      }
    },

    clear(context) {
      log.info('clearing the session')

      context.state.pages.forEach(page => {
        log.info('deleting %s', page.fileName)

        fs.unlinkSync(page.fileName)
      })

      context.state.pages = []
    }
  }
}

export default sessionStore

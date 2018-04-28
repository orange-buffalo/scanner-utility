import {app, BrowserWindow, dialog, ipcMain, screen} from 'electron'
import log from 'electron-log'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`

function createWindow() {
  const screenHeight = screen.getPrimaryDisplay().workAreaSize.height
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: screenHeight * 0.9,
    width: screenHeight * 0.8,
    webPreferences: {
      webSecurity: false,
      experimentalFeatures: true
    },
    show: false,
    center: true
  })

  mainWindow.setMenu(null)

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.loadURL(winURL)

  app.showExitPrompt = true

  ipcMain.on('quit-response', (event, response) => {
    log.info('quit response received: %j', response)
    if (response.canClose) {
      app.showExitPrompt = false
      mainWindow.close()
    }
    else {
      dialog.showMessageBox({
        type: 'question',
        buttons: ['Yes', 'No'],
        title: 'Unsaved changes are pending',
        message: `There are ${response.pagesCount} pages scanned and they are not saved. Are you sure to close the app and loose all the scanned pages?`
      }, (response) => {
        if (response === 0) {
          mainWindow.webContents.send('quit-request', {force: true})
        }
      })
    }
  })

  mainWindow.on('close', (e) => {
    if (app.showExitPrompt) {
      e.preventDefault()
      mainWindow.webContents.send('quit-request', {force: false})
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */

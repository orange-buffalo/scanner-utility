const {app} = require('electron').remote
import fs from 'fs'

let fileStorage = {

  createNewFile: function () {
    let dir = `${app.getPath('userData')}/session/`
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
    return `${dir}/${new Date().getTime()}.jpg`
  }

}

export default fileStorage
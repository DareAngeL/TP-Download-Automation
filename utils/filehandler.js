const path = require('path')
const fs = require('fs')
const { log } = require('console')
const cl = require('cli-color')

const source = 'C:/Users/maste/Downloads'
const target = 'C:/Work/TP File Backup'
const logPath = './last_dl.log'
const unGenCodeLogPath = './unable_to_gen_code.log'

const extName = '.zip'
const fileResKeywords = ['<', '>', ':', '"', '/', '\\', '|', '?', '*']

const writeLog = (content) => {
  fs.writeFile(logPath, content, (err) => {
    if (err) throw err
  })
}

const writeUnGenCodeLog = (content) => {
  fs.appendFile(unGenCodeLogPath, content, (err) => {
    if (err) throw err
  })
}

const readUnGenCodeLog = () => fs.readFileSync(unGenCodeLogPath, 'utf8')

const makeFolder = (folderName) => {
  const folder = `${target}/${folderName}`
  try {
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, {recursive: true});
    }
  } catch (err) {
    console.error(err);
  }
}

const moveFiles = (folderName) => {
  fs.readdirSync(source).forEach(file => {
    const fileName = path.basename(file)
    if (path.extname(file).toLowerCase() == extName) {
      fs.rename(`${source}/${fileName}`, `${target}/${folderName}/${fileName}`, err => {
        if (err) { console.log(err); }
      });
    }
  })
}

const segregateFiles = (folderName) => {
  const folder = folderName.replaceAll(' / ', '/')
  log(cl.blueBright('Segregating all downloaded files..Please wait...'))
  makeFolder(folder)
  moveFiles(folder)
  log(cl.greenBright('Done segregating.'))
}

/**
 * Check and change the file or folder name if it uses the reserved keywords
 * @param {string} name 
 * @return The new changed file name
 */
const checkFileOrFolderNaming = (name) => {
  let newName = name
  // eslint-disable-next-line no-unused-vars
  fileResKeywords.forEach((item, index, arr) => {
    if (name.includes(item)) {
      newName = name.replaceAll(item, '-')
    }
  })
  return newName
}

module.exports = { segregateFiles, writeLog, makeFolder, writeUnGenCodeLog, readUnGenCodeLog, checkFileOrFolderNaming }
/* eslint-disable no-useless-escape */
const { By } = require('selenium-webdriver')
const prompt = require('prompt-sync')()
const parameters = require('./params/parameters')
const { segregateFiles, writeLog, writeUnGenCodeLog, checkFileOrFolderNaming } = require('./utils/filehandler')
const { log, clear } = require('./utils/console')
const cl = require('cli-color')
const cliSelect = require('cli-select')

let page
const loginURL = parameters.TP_URL
const cred = require('./params/cred').credentials
const projects = parameters.projects

const projRootFoldersScript = `
  return document.querySelector('div.tp-folders-wrapper.ng-isolate-scope')?.children
`
const projChildrenFoldersScript = `
  return document.querySelector('div.tp-folders-wrapper.ng-isolate-scope.children-folders')?.children
`

let currentOpenProject
let projectTitleBanner

/**
 * The program execution starts here
 */
const init = async () => {

  log(cl.cyanBright.bold(`
  ****************************************************
  *********** LSTV TP Download Automation ************
  ****************************************************
  `))

  await projectSelection(true)
  if (page)
    await page.close()
}

/**
 * Project selection
 */
const projectSelection = async (loginAlso) => {
  log(cl.greenBright('Select a project to download scripts from:'))
  let _projects = []
  for (const key in projects) {
    _projects.push(`${projects[key].name}`)
  }

  await cliSelect({
    values: _projects,
    valueRenderer: (value, selected) => {
      if (selected) {
        return `${cl.green(`> ${cl.green.underline(value)} <`)}`
      }

      return value
    },
  }).then(async (res) => {
    await openProject(loginAlso, res.id+1)
  })/*.catch((err) => {
    log(`${cl.bgYellow('Info:')} ${cl.yellow.bold(err)}`)
    setTimeout(() => {
      log(cl.yellow('Exiting...'))
      setTimeout(() => {
        process.exit()
      }, 2000)
    }, 500)
  })*/
}

/**
 * Open a selected project
 * @param {boolean} loginAlso 
 * @param {*} selectedProject 
 */
const openProject = async (loginAlso, selectedProject) => {
  const confirmation = prompt(cl.cyanBright(`Open project ${projects[selectedProject].name}... (Y/n) ?: `))

  if (confirmation === 'Y' || confirmation === 'y') {
    clear()
    page = require('./selenium/page')
    const project = projects[selectedProject]

    currentOpenProject = project.name
    projectTitleBanner = cl.greenBright.bold(`\nProject ${project.name}`)

    log(projectTitleBanner)
    log(cl.blue('Automating...'))

    if (loginAlso)
      await login()
    
    await automate(false, project.url, projRootFoldersScript)
  } else {
    clear()
    await projectSelection(loginAlso)
  }
}

/**
 * Navigate to TP website and login
 */
const login = async () => {
  const userLoc = By.id('username')
  const passLoc = By.id('password')
  const loginBtnLoc = By.id('tp-sign-in')

  log(cl.greenBright('\nLogging in...'))
  // navigate to TP login page
  await page.url(loginURL)
  // input credentials
  await page.inputField(userLoc, cred.user)
  await page.inputField(passLoc, cred.pass)
  // login
  await page.clickElement(loginBtnLoc)
}

/**
 * Automate a project
 * @param {string} url
 */
const automate = async(isFromContDL, url, folderScript) => {
  await page.navigateTo(url)

  log(`${cl.bgYellow('Note:')} ${cl.yellow('Scroll the "Tests" category down to the bottom to fully load all the tests before choosing to download tests.')}`)
  
  log(`Currently open folder: ${cl.blueBright(currentOpenProject)}`)
  currentOpenProject = checkFileOrFolderNaming(currentOpenProject)
  await navOptions(
    ['Download Tests', 'Navigate through the folders'], 
    currentOpenProject, 
    folderScript
  )

  if (!isFromContDL) {
    const res = prompt(cl.cyanBright('We are done on this project. Select another project? (Y/n): '))
    if (res === 'Y' || res === 'y') {
      clear()
      await projectSelection(false)
    }
  }
}

/**
 * Starts downloading all visible tests.
 */
const startDownloading = async(activeFolder) => {
  log(cl.blueBright('Downloading tests...Please wait....'))
  const genCodeXpath = `\"/html/body/div[6]/div/div[12]\"`
  const pythonBtnLoc = By.xpath(`/html/body/div[1]/tp-movable/ng-transclude/div/div[2]/tp-mbw-dynamic-template/div/div/div[4]/div/div[3]`)
  const dlBtnLoc = By.xpath(`/html/body/div[1]/tp-movable/ng-transclude/div/div[3]/div[3]/div`)
  const okayBtnLoc = By.xpath(`/html/body/div[1]/tp-movable/ng-transclude/div/div[3]/div[3]/div`)
  const unableToGenCodeXpath = `/html/body/div[1]/tp-movable/ng-transclude/div/div[2]/tp-mbw-dynamic-template/div/div/div[1]/span`

  const testsCountScript = `
    const testContainerElem = document.querySelector('div.content-items-container')
    return testContainerElem?.children.length
  `

  const testsCount = await page.execScript(testsCountScript)
  for (let i=0; i<testsCount; i++) {
    const testTitleXpath = `/html/body/div[1]/div[1]/div/div[1]/div/div[1]/div/main/div[3]/div[2]/div/div[1]/div[2]/div[2]/div/div[1]/div/div[1]/div[${i+1}]/div/div/div[1]/div/div/div[3]/div[1]`
    const testMenuXpath = `\"/html/body/div[1]/div[1]/div/div[1]/div/div[1]/div/main/div[3]/div[2]/div/div[1]/div[2]/div[2]/div/div[1]/div/div[1]/div[${i+1}]/div/div/div[2]/div/div/div/div[4]/div\"`
    const testMenuXpath2 = `\"/html/body/div[1]/div[1]/div/div[1]/div/div[1]/div/main/div[3]/div[2]/div/div[1]/div[2]/div[2]/div/div[1]/div/div[1]/div[${i+1}]/div/div/div[2]/div/div/div/div[5]/div\"`

    const testTitleScript = `
      return document.evaluate("${testTitleXpath}", document, null, XPathResult.ANY_TYPE, null).iterateNext().innerHTML
    `
    const testTitle = await page.execScript(testTitleScript)

    try {
      await performJSClick(testMenuXpath)
    } catch (err) {
      try {
        await performJSClick(testMenuXpath2)
      } catch (err) {
        log(`${cl.bgRed('ERROR:')} Unable to download test. Please manually download the test.`)
        log(`${cl.bgYellow('INFO:')} Test name: ${cl.blueBright(testTitle)}`)
        prompt(`Press enter to continue downloading the rest of the tests.`)
        continue
      }
    }
    await performJSClick(genCodeXpath)

    await clickDownloadBtn(pythonBtnLoc, dlBtnLoc)
    const downloadSuccess = await page.execScript(`
      const elemText = document.evaluate("${unableToGenCodeXpath}", document, null, XPathResult.ANY_TYPE, null).iterateNext().innerHTML
      if (elemText.includes('The Generated Code is ready!')) {
        return 1
      }
      
      return -1
    `)

    // determine if the download is successful or not
    if (await downloadSuccess !== 1) {
      log(`${cl.bgYellow('WARNING:')} Unable to download test at position: ${i+1}`)
      await page.sleep(2000)
      // add log
      const unGenCodeLog = `
      {
        testTitle: ${testTitle}
        position: ${i+1}
        folderURL: ${await page.getURL()}
        path: ${activeFolder}
      }\n
      `
      // write the new log to the file
      writeUnGenCodeLog(unGenCodeLog)
    } else {
      const log = `
      LAST_DOWNLOADED_TEST
      {
        testTitle: ${testTitle}
        position: ${i}
        folderURL: ${await page.getURL()}
        path: ${activeFolder}
      }\n
      `
      writeLog(log)
    }
    
    await page.clickElement(okayBtnLoc)
  }

  log(cl.greenBright.bold(`Downloading is done!.`))
  prompt(cl.cyanBright('\nPress enter to continue to the next folder'))
}

const clickDownloadBtn = async(pythonBtnLoc, dlBtnLoc) => {
  await page.clickElement(pythonBtnLoc)
  await page.clickElement(dlBtnLoc)

  const btnText = await page.getElementText(dlBtnLoc)
  if (btnText === 'Download') {
    await clickDownloadBtn(pythonBtnLoc, dlBtnLoc)
  }
}

const performJSClick = async(xpath) => {
  const testMenuScript = `
    document.evaluate(${xpath}, document, null, XPathResult.ANY_TYPE, null).iterateNext().click()
  `

  await page.execScript(testMenuScript)
}

/**
 * Navigate from folder to folder
 * @param {string} script 
 */
const navigateToFolders = async(fromDir, script) => {
  clear()
  const projPrevBtnXpath = '//*[@id=\"project-expanded-side-bar\"]/div[3]/div[1]/div[2]/div/div/div[2]/div'
  // get all the folders from the {fromDir}
  const projFolders = await page.execScript(script)

  if (projFolders.length-1 > 0) {
    const foldersName = []
    for (let i=0; i<projFolders.length-1; i++) {
      const folderName = await page.execScript(`
        const elem = document.evaluate("/html/body/div[1]/div[1]/div/div[1]/div/div[1]/div/main/div[3]/div[1]/div/div[3]/div[1]/div[2]/div/div/div[2]/div[1]/div/div/div[${i+1}]/span", document, null, XPathResult.ANY_TYPE, null).iterateNext()
        if (elem === null)
          return document.evaluate("/html/body/div[1]/div[1]/div/div[1]/div/div[1]/div/main/div[3]/div[1]/div/div[3]/div[1]/div[2]/div/div/div[3]/div[1]/div/div/div[${i+1}]/span", document, null, XPathResult.ANY_TYPE, null).iterateNext().innerHTML

        return elem.innerHTML
      `)
      foldersName.push(folderName)
    }
    log(`${cl.green('\nSelect a folder from where to start traversing:')}`)
    await cliSelect({
      values: foldersName,
      valueRenderer: (value, selected) => {
        if (selected) {
          return `${cl.green(`> ${cl.green.underline(value)} <`)}`
        }
        return value
      }
    }).then(async (res) => {
      await traverse(res.id, projFolders.length-1, foldersName, fromDir, script)
    })
  }

  log(`${cl.bgYellowBright('Info:')} ${cl.yellowBright(`No folders, going back to the previous directory...`)}\n`)
  const prevBtnTitle = await page.execScript(`
    return document.evaluate('${projPrevBtnXpath}', document, null, XPathResult.ANY_TYPE, null).iterateNext().title
  `)
  if (prevBtnTitle.includes('Up to'))
    await page.execScript(`
      document.evaluate('${projPrevBtnXpath}', document, null, XPathResult.ANY_TYPE, null).iterateNext().click()
    `)
}

const traverse = async(start, max, foldersName, fromDir, script) => {
  let activeFolder
  for (let i=start; i<max; i++) {
    const folderName = foldersName[i]

    activeFolder = `${fromDir} / ${checkFileOrFolderNaming(folderName)}`

    await page.execScript(`${script}[${i}].click()`)
    log(cl.blueBright(`\nNavigating to ${activeFolder}...`))

    log(`${cl.bgYellow('Note:')} ${cl.yellow('Scroll the "Tests" category down to the bottom to fully load all the tests before choosing to download tests.')}`)
    log(`Currently opened folder: ${activeFolder}`)
    
    await navOptions(
      ['Download Tests Here', 'Next Folder'],
      activeFolder, 
      projChildrenFoldersScript
    )
  }
}

const navOptions = async(opts, activeFolder, script) => {
  await cliSelect({
    values: opts,
    valueRenderer: (value, selected) => {
      if (selected) {
        return `${cl.green(`> ${cl.green.underline(value)} <`)}`
      }
      return value
    }
  }).then(async res => {
    if (res.id === 0) {
      // start downloading tests on the ${folderName} dir
      await startDownloading(activeFolder)
      // after downloading, segregate the files
      segregateFiles(activeFolder)
      
      await navigateToFolders(activeFolder, script)
      return
    }

    await navigateToFolders(activeFolder, script)
  })
}

init()
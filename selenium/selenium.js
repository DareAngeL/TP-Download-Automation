const { Builder, Browser, until } = require("selenium-webdriver")
// const { Options } = require("selenium-webdriver/edge")

// const opt = new Options().excludeSwitches('enable-logging')
const edgeDriver = new Builder().forBrowser(Browser.EDGE).build()

class SeleniumUtil {
  constructor() {
    global.driver = edgeDriver
  }

  /**
   * Navigate to a web page
   * @param url the web page's url
   */
  async navigateTo(url) {
    await edgeDriver.get(url)
  }

  async getURL() {
    return await edgeDriver.getCurrentUrl()
  }

  /**
   * Locate an element
   * @param locator The locator of the element
   * @returns The located element
   */
  async element(locator) {
    return await edgeDriver.findElement(locator)
  }

  async elements(locator) {
    return await edgeDriver.findElements(locator)
  }

  async execScript(script) {
    return await edgeDriver.executeScript(script)
  }

  /**
   * @param {WebElement} element
   */
  async moveMouseToElement(element) {
    const actions = edgeDriver.actions();
    // Performs mouse move action onto the element
    await actions.move({duration: 1000, origin:element, x: 1, y: 1}).perform();
  }

  /**
   * Wait until an element is located
   * @param locator The locator of the element
   * @returns The located element
   */
  async elementUntilLocated(locator) {
    return await edgeDriver.wait(until.elementLocated(locator), 3600000)
  }

  async acceptAlert() {
    await edgeDriver.switchTo().alert().accept()
  }
  /**
   * Quit the driver
   */
  async close() {
    await edgeDriver.quit()
  }
}

module.exports = SeleniumUtil
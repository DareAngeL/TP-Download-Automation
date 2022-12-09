const { log } = require("../utils/console");
const SeleniumUtil = require("./selenium");

class Page extends SeleniumUtil {

  /**
   * The URL for the page
   * @param url 
   */
  async url(url) {
    await this.navigateTo(url)
  }

  /**
   * Click an element on the page
   * @param locator The element's locator
   */
  async clickElement(locator) {
    const elem = await this.elementUntilLocated(locator)
    await elem.click()
  }

  async isElementExist(locator) {
    log((`${(await this.elements(locator)).length}`))
    return (await this.elements(locator)).length > 0
  }

  async getElementText(locator) {
    return await (await this.elementUntilLocated(locator)).getText()
  }

  async inputField(locator, text) {
    await (await this.elementUntilLocated(locator)).sendKeys(text)
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}

module.exports = new Page()
import { Page, ElementHandle, Browser, Response } from "puppeteer-core";
import { iResponse, iValue, ScreenshotOpts } from "./interfaces";
import { BrowserControl } from "./browsercontrol";
import { DOMResponse } from "./domresponse";
import { PuppeteerElement } from "./puppeteerelement";
import { toType } from "./util";

export abstract class PuppeteerResponse extends DOMResponse
  implements iResponse {
  /**
   * Is this a browser based test
   */
  public get isBrowser(): boolean {
    return true;
  }

  public get browserControl(): BrowserControl {
    return this.scenario.getBrowserControl();
  }

  public get page(): Page | null {
    return this.scenario.getBrowserControl().page;
  }

  public get browser(): Browser | null {
    return this.scenario.getBrowserControl().browser;
  }

  public get response(): Response | null {
    return this.scenario.getBrowserControl().response;
  }

  public abstract async find(path: string): Promise<iValue>;
  public abstract async findAll(path: string): Promise<iValue[]>;

  /**
   * Run this code in the browser
   */
  public async evaluate(callback: Function | string): Promise<any> {
    if (this.page !== null) {
      if (typeof callback == "function") {
        const functionName: string = `flagpole_${Date.now()}`;
        const jsToInject: string = `window.${functionName} = ${callback}`;
        await this.page.addScriptTag({ content: jsToInject });
        return await this.page.evaluate((functionName) => {
          // @ts-ignore This is calling into the browser, so don't do an IDE error
          return window[functionName]();
        }, functionName);
      } else {
        return await this.page.evaluate(callback);
      }
    }
    throw new Error("Cannot evaluate code becuase page is null.");
  }

  /**
   * Wait for network to be idle for 500ms before continuing
   *
   * @param timeout
   */
  public async waitForNetworkIdle(timeout: number = 10000): Promise<void> {
    if (this.page !== null) {
      await this.page.waitForNavigation({
        timeout: timeout,
        waitUntil: "networkidle0",
      });
      return;
    }
    return super.waitForNetworkIdle(timeout);
  }

  /**
   * Wait for network to have no more than two connections for 500ms before continuing
   *
   * @param timeout
   */
  public async waitForNavigation(
    timeout: number = 10000,
    waitFor?: string | string[]
  ): Promise<void> {
    if (this.page !== null) {
      const allowedOptions: string[] = [
        "load",
        "domcontentloaded",
        "networkidle0",
        "networkidle2",
      ];
      // @ts-ignore VS Code freaks out about this, but it's valid return output for LoadEvent
      const waitForEvent: LoadEvent[] = (() => {
        if (
          typeof waitFor == "string" &&
          allowedOptions.indexOf(waitFor) >= 0
        ) {
          return [waitFor];
        } else if (
          toType(waitFor) == "array" &&
          (<string[]>waitFor).every((waitForItem) => {
            return allowedOptions.indexOf(waitForItem) >= 0;
          })
        ) {
          return waitFor;
        } else {
          return ["networkidle2"];
        }
      })();
      await this.page.waitForNavigation({
        timeout: timeout,
        waitUntil: waitForEvent,
      });
      return;
    }
    return super.waitForNavigation(timeout, waitFor);
  }

  /**
   * Wait for everything to load before continuing
   *
   * @param timeout
   */
  public async waitForLoad(timeout: number = 30000): Promise<void> {
    if (this.page !== null) {
      await this.page.waitForNavigation({
        timeout: timeout,
        waitUntil: "load",
      });
      return;
    }
    return super.waitForLoad(timeout);
  }

  /**
   * Wait for DOM Loaded before continuing
   *
   * @param timeout
   */
  public async waitForReady(timeout: number = 15000): Promise<void> {
    if (this.page !== null) {
      await this.page.waitForNavigation({
        timeout: timeout,
        waitUntil: "domcontentloaded",
      });
      return;
    }
    return super.waitForReady(timeout);
  }

  /**
   * Wait for element at the selected path to be hidden
   *
   * @param selector
   * @param timeout
   */
  public async waitForHidden(
    selector: string,
    timeout: number = 100
  ): Promise<PuppeteerElement> {
    if (this.page !== null) {
      const opts = { timeout: timeout || 100, hidden: true };
      const element = await this.page.waitForSelector(selector, opts);
      return PuppeteerElement.create(element, this.context, selector, selector);
    }
    throw new Error("waitForHidden is not available in this context");
  }

  public async waitForVisible(
    selector: string,
    timeout: number = 100
  ): Promise<PuppeteerElement> {
    if (this.page !== null) {
      const opts = { timeout: timeout || 100, visible: true };
      const element = await this.page.waitForSelector(selector, opts);
      return PuppeteerElement.create(element, this.context, selector, selector);
    }
    throw new Error("waitForVisible is not available in this context");
  }

  public async waitForExists(
    selector: string,
    timeout?: number
  ): Promise<PuppeteerElement> {
    if (this.page !== null) {
      const opts = { timeout: timeout || 100 };
      const element = await this.page.waitForSelector(selector, opts);
      return PuppeteerElement.create(element, this.context, selector, selector);
    }
    throw new Error("waitForExists is not available in this context");
  }

  public async waitForXPath(
    xPath: string,
    timeout?: number
  ): Promise<PuppeteerElement> {
    if (this.page !== null) {
      const opts = { timeout: timeout || 100 };
      const element = await this.page.waitForXPath(xPath, opts);
      return PuppeteerElement.create(element, this.context, xPath, xPath);
    }
    throw new Error("waitForXPath is not available in this context");
  }

  public async waitForHavingText(
    selector: string,
    text: string,
    timeout?: number
  ): Promise<PuppeteerElement> {
    if (this.page !== null) {
      const opts = { timeout: timeout || 100 };
      const element = await this.page.waitForFunction(
        `document.querySelector("${selector}").innerText.includes("${text}")`,
        opts
      );
      return PuppeteerElement.create(element, this.context, selector, selector);
    }
    throw new Error("waitForExists is not available in this context");
  }

  public screenshot(): Promise<Buffer>;
  public screenshot(localFilePath: string): Promise<Buffer>;
  public screenshot(
    localFilePath: string,
    opts: ScreenshotOpts
  ): Promise<Buffer>;
  public screenshot(opts: ScreenshotOpts): Promise<Buffer>;
  public screenshot(
    a?: string | ScreenshotOpts,
    b?: ScreenshotOpts
  ): Promise<Buffer> {
    const localFilePath = typeof a == "string" ? a : undefined;
    const opts: ScreenshotOpts = (typeof a !== "string" ? a : b) || {};
    if (this.page !== null) {
      return this.page.screenshot({
        path: localFilePath || opts.path,
        encoding: "binary",
        omitBackground: opts.omitBackground || false,
        clip: opts.clip || undefined,
        fullPage: opts.fullPage || false,
      });
    }
    throw new Error(`No page found, so can't take a screenshot.`);
  }

  public async type(
    selector: string,
    textToType: string,
    opts: any = {}
  ): Promise<any> {
    if (this.page !== null) {
      return await this.page.type(selector, textToType, opts);
    }
    throw new Error(`Can not type into element ${selector}`);
  }

  public async clear(selector: string): Promise<any> {
    if (this.page !== null) {
      const input: ElementHandle<Element> | null = await this.page.$(selector);
      if (input !== null) {
        await input.click({ clickCount: 3 });
        return await this.page.keyboard.press("Backspace");
      }
    }
    throw new Error(`Can not type into this element ${selector}`);
  }

  public selectOption(
    selector: string,
    value: string | string[]
  ): Promise<string[]> {
    if (this.page !== null) {
      const values: string[] = typeof value == "string" ? [value] : value;
      return this.page.select.apply(
        this.page,
        // @ts-ignore VS Code is unhappy no matter what I do
        [selector].concat(values)
      );
    }
    throw new Error("Page was null.");
  }
}

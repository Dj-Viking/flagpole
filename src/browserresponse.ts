import { DOMElement } from "./domelement";
import { iResponse, GenericResponse, ResponseType } from "./response";
import { Browser } from './browser';
import { Page, ElementHandle } from 'puppeteer';

export class BrowserResponse extends GenericResponse implements iResponse {

    public get typeName(): string {
        return 'Browser';
    }

    public get browser(): Browser {
        return this.scenario.getBrowser();
    }

    public get page(): Page | null {
        return this.scenario.getBrowser().getPage();
    }

    public get type(): ResponseType {
        return ResponseType.browser;
    }

    /**
     * Select the first matching element
     * 
     * @param path 
     */
    public async find(path: string): Promise<DOMElement | null> {
        const response: iResponse = this;
        const page: Page | null = this.scenario.getBrowser().getPage();
        if (page !== null) {
            const el: ElementHandle<Element> | null = await page.$(path);
            if (el !== null) {
                return await DOMElement.create(
                    el, this.context, null, path
                );
            }
        }
        return null;
    }

    /**
     * Select all matching elements
     * 
     * @param path 
     */
    public async findAll(path: string): Promise<DOMElement[]> {
        const response: iResponse = this;
        const page: Page | null = this.scenario.getBrowser().getPage();
        const domElements: DOMElement[] = [];
        if (page !== null) {
            const elements: ElementHandle[] = await page.$$(path);
            await elements.forEach(async function (el: ElementHandle<Element>, i: number) {
                const domElement = await DOMElement.create(
                    el, response.context, `${path} [${i}]`, path
                );
                domElements.push(domElement);
            });
        }
        return domElements;
    }

    /**
     * Runt his code in the browser
     */
    public async evaluate(context: any, callback: Function): Promise<any> {
        if (this.page !== null) {
            const functionName: string = `flagpole_${Date.now()}`;
            const jsToInject: string = `window.${functionName} = ${callback}`;
            await this.page.addScriptTag({ content: jsToInject });
            return await this.page.evaluate(functionName => {
                // @ts-ignore This is calling into the browser, so don't do an IDE error
                return window[functionName]();
            }, functionName);
        }
        throw new Error('Cannot evaluate code becuase page is null.');
    }

}

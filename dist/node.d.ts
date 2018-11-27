import { Scenario } from "./scenario";
import { iResponse } from "./response";
export declare enum NodeType {
    Generic = 0,
    StyleAttribute = 1,
}
export declare class Node {
    protected response: iResponse;
    protected name: string;
    protected obj: any;
    protected typeOfNode: NodeType;
    protected selector: string | null;
    constructor(response: iResponse, name: string, obj: any);
    protected isNullOrUndefined(): boolean;
    protected isDomElement(): boolean;
    tagName(): Node;
    protected getTagName(): string | null;
    protected getAttribute(name: string): string | null;
    protected getUrl(): string | null;
    protected isFormElement(): boolean;
    protected isButtonElement(): boolean;
    protected isLinkElement(): boolean;
    protected isImageElement(): boolean;
    protected isScriptElement(): boolean;
    protected isStylesheetElement(): boolean;
    protected isClickable(): boolean;
    protected isArray(): boolean;
    protected isString(): boolean;
    protected isObject(): boolean;
    protected hasProperty(key: string): boolean;
    protected pass(message: string): Scenario;
    protected fail(message: string): Scenario;
    get(index?: number): any;
    toString(): string;
    select(path: string, findIn?: any): Node;
    headers(key?: string): Node;
    status(): Node;
    loadTime(): Node;
    and(): Node;
    not(): Node;
    comment(message: string): Node;
    label(message: string): Node;
    echo(): Node;
    typeof(): Node;
    click(scenarioOrTitle: string | Scenario, impliedAssertion?: boolean): Scenario;
    submit(scenarioOrTitle: string | Scenario, impliedAssertion?: boolean): Scenario;
    fillForm(formData: any): Node;
    protected getLambdaScenario(scenarioOrTitle: string | Scenario, impliedAssertion?: boolean): Scenario;
    load(scenarioOrTitle: string | Scenario, impliedAssertion?: boolean): Scenario;
    find(selector: string): Node;
    closest(selector: string): Node;
    parents(selector?: string): Node;
    parent(): Node;
    siblings(selector: any): Node;
    children(selector: any): Node;
    next(selector: any): Node;
    prev(selector: any): Node;
    eq(i: number): Node;
    nth(i: number): Node;
    first(): Node;
    last(): Node;
    css(key: string): Node;
    attribute(key: string): Node;
    property(key: string): Node;
    data(key: string): Node;
    val(): Node;
    text(): Node;
    length(): Node;
    type(): Node;
    parseFloat(): Node;
    parseInt(): Node;
    trim(): Node;
    toLowerCase(): Node;
    toUpperCase(): Node;
    decodeURI(): Node;
    decodeURIComponent(): Node;
    encodeURI(): Node;
    encodeURIComponent(): Node;
    replace(search: string | RegExp, replace: string): Node;
    each(callback: Function): Node;
    every(callback: Function): Node;
    some(callback: Function): Node;
    any(callback: Function): Node;
    hasClass(className: string): Node;
    greaterThan(value: number): Node;
    greaterThanOrEquals(value: any): Node;
    lessThan(value: number): Node;
    lessThanOrEquals(value: any): Node;
    between(minValue: any, maxValue: any): Node;
    assert(statement: boolean, message: string, actualValue?: string): Node;
    contains(string: string): Node;
    contain(string: string): Node;
    matches(pattern: RegExp): Node;
    startsWith(matchText: string): Node;
    endsWith(matchText: string): Node;
    is(type: string): Node;
    exists(): Node;
    equals(value: any, permissiveMatching?: boolean): Node;
    similarTo(value: any): Node;
    in(arrayOfValues: string[]): Node;
}

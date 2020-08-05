import {
  iAssertionContext,
  iValue,
  iResponse,
  FindAllOptions,
  FindOptions,
} from "./interfaces";
import { Value } from "./value";
import { toType, asyncFilter } from "./util";

export function wrapAsValue(
  context: iAssertionContext,
  data: any,
  name: string,
  source?: any
): iValue {
  return new Value(data, context, name, source);
}

export async function findOne(
  scope: iValue | iResponse,
  selector: string,
  params: FindParams
) {
  const opts = {
    ...params.opts,
    ...{ limit: 1 },
  };
  const elements =
    params.contains !== null
      ? await scope.findAll(selector, params.contains, opts)
      : params.matches !== null
      ? await scope.findAll(selector, params.matches, opts)
      : await scope.findAll(selector, opts);
  return elements[0] || wrapAsValue(scope.context, null, selector);
}

export type FindParams = {
  contains: string | null;
  matches: RegExp | null;
  opts: FindOptions | FindAllOptions | null;
};

export function getFindName(params: FindParams, selector: string, i: number) {
  return params.contains
    ? `${selector} containing "${params.contains}"`
    : params.matches
    ? `${selector} matching ${String(params.matches)}`
    : `${selector}[${i}]`;
}

export function getFindParams(a: any, b: any): FindParams {
  const contains = typeof a === "string" ? a : null;
  const matches = toType(a) === "RegExp" ? a : null;
  const opts = (contains || matches ? b : a || b) || null;
  return { contains: contains, matches: matches, opts: opts };
}

export async function filterFind(
  elements: iValue[],
  contains?: string | RegExp | null,
  opts?: FindAllOptions | null
) {
  const containsType = toType(contains);
  // No changes if no opts
  if (opts === undefined) {
    return elements;
  }
  // Filter by contents
  if (contains) {
    elements = await asyncFilter(elements, async (element: iValue) => {
      const text: string = await (async () => {
        if (opts?.findBy == "value") {
          return (await element.getValue()).$;
        }
        if (opts?.findBy == "html") {
          return (await element.getOuterHtml()).$;
        }
        return (await element.getText()).$;
      })();
      if (containsType == "RegExp") {
        return (contains as RegExp).test(text.toString());
      }
      return text.toLowerCase().indexOf(String(contains).toLowerCase()) >= 0;
    });
  }
  // Apply offset and limit
  if (opts?.offset || opts?.limit) {
    const start = opts.offset || 0;
    const end = opts.limit ? start + opts.limit : undefined;
    elements = elements.slice(start, end);
  }
  return elements;
}

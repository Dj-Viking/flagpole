import { createStandardValue } from ".";
import { ContextProvider } from "../interfaces/context-provider";
import { FindParams } from "../interfaces/find-options";
import { FindProvider } from "../interfaces/find-provider";

export async function findOne(
  scope: FindProvider & ContextProvider,
  selector: string,
  params: FindParams
) {
  const opts = {
    ...params.opts,
    ...{ limit: 1 },
  };
  const elements = await (() => {
    if (params.contains) return scope.findAll(selector, params.contains, opts);
    if (params.matches) return scope.findAll(selector, params.matches, opts);
    return scope.findAll(selector, opts);
  })();
  return elements.length
    ? elements[0]
    : createStandardValue(null, scope.context, { selector, name: selector });
}

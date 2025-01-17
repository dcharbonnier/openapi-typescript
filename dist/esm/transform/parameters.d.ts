import type { GlobalContext, ParameterObject, ReferenceObject } from "../types";
interface TransformParametersOptions extends GlobalContext {
    globalParameters?: Record<string, ParameterObject>;
}
export declare function transformParametersArray(parameters: (ReferenceObject | ParameterObject)[], options: TransformParametersOptions): string;
export {};

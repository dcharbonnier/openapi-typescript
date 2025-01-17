import type { GlobalContext, OperationObject, ParameterObject, PathItemObject } from "../types";
interface TransformPathsObjOption extends GlobalContext {
    globalParameters: Record<string, ParameterObject>;
    operations: Record<string, {
        operation: OperationObject;
        pathItem: PathItemObject;
    }>;
}
export declare function transformPathsObj(paths: Record<string, PathItemObject>, options: TransformPathsObjOption): string;
export {};

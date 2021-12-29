var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, copyDefault, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && (copyDefault || key !== "default"))
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toESM = (module2, isNodeMode) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", !isNodeMode && module2 && module2.__esModule ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};
var __toCommonJS = /* @__PURE__ */ ((cache) => {
  return (module2, temp) => {
    return cache && cache.get(module2) || (temp = __reExport(__markAsModule({}), module2, 1), cache && cache.set(module2, temp), temp);
  };
})(typeof WeakMap !== "undefined" ? /* @__PURE__ */ new WeakMap() : 0);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  WARNING_MESSAGE: () => WARNING_MESSAGE,
  default: () => src_default
});
var import_path2 = __toESM(require("path"), 1);
var import_prettier = __toESM(require("prettier"), 1);
var import_parser_typescript = __toESM(require("prettier/parser-typescript.js"), 1);
var import_url2 = require("url");

// src/load.ts
var import_node_fetch = __toESM(require("node-fetch"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_url = require("url");
var import_mime = __toESM(require("mime"), 1);
var import_js_yaml = __toESM(require("js-yaml"), 1);

// src/utils.ts
function prepareComment(v) {
  const commentsArray = [];
  if (v.title)
    commentsArray.push(`${v.title} `);
  if (v.format)
    commentsArray.push(`Format: ${v.format} `);
  if (v.deprecated)
    commentsArray.push(`@deprecated `);
  const supportedJsDocTags = ["description", "default", "example"];
  for (let index = 0; index < supportedJsDocTags.length; index++) {
    const field = supportedJsDocTags[index];
    if (v[field])
      commentsArray.push(`@${field} ${v[field]} `);
  }
  if (!commentsArray.length)
    return;
  return comment(commentsArray.join("\n"));
}
function comment(text) {
  const commentText = text.trim().replace(/\*\//g, "*\\/");
  if (commentText.indexOf("\n") === -1) {
    return `/** ${commentText} */
`;
  }
  return `/**
  * ${commentText.replace(/\r?\n/g, "\n  * ")}
  */
`;
}
function parseRef(ref) {
  if (typeof ref !== "string" || !ref.includes("#"))
    return { parts: [] };
  const [url, parts] = ref.split("#");
  return {
    url: url || void 0,
    parts: parts.split("/").filter((p) => !!p).map(decodeRef)
  };
}
function isRef(obj) {
  return !!obj.$ref;
}
function nodeType(obj) {
  if (!obj || typeof obj !== "object") {
    return "unknown";
  }
  if (obj.$ref) {
    return "ref";
  }
  if (Array.isArray(obj.enum) && obj.enum.length) {
    return "enum";
  }
  if (obj.type === "boolean") {
    return "boolean";
  }
  if (["binary", "byte", "date", "dateTime", "password", "string"].includes(obj.type)) {
    return "string";
  }
  if (["double", "float", "integer", "number"].includes(obj.type)) {
    return "number";
  }
  if (obj.type === "array" || obj.items) {
    return "array";
  }
  if (obj.type === "object" || obj.hasOwnProperty("allOf") || obj.hasOwnProperty("anyOf") || obj.hasOwnProperty("oneOf") || obj.hasOwnProperty("properties") || obj.hasOwnProperty("additionalProperties")) {
    return "object";
  }
  return "unknown";
}
function swaggerVersion(definition) {
  if ("openapi" in definition) {
    if (parseInt(definition.openapi, 10) === 3) {
      return 3;
    }
  }
  if ("swagger" in definition) {
    if (typeof definition.swagger === "number" && Math.round(definition.swagger) === 2) {
      return 2;
    }
    if (parseInt(definition.swagger, 10) === 2) {
      return 2;
    }
  }
  throw new Error(`\u2718  version missing from schema; specify whether this is OpenAPI v3 or v2 https://swagger.io/specification`);
}
function decodeRef(ref) {
  return ref.replace(/\~0/g, "~").replace(/\~1/g, "/").replace(/"/g, '\\"');
}
function tsArrayOf(type) {
  return `(${type})[]`;
}
function tsTupleOf(types) {
  return `[${types.join(", ")}]`;
}
function tsIntersectionOf(types) {
  const typesWithValues = types.filter(Boolean);
  if (typesWithValues.length === 1)
    return typesWithValues[0];
  return `(${typesWithValues.join(") & (")})`;
}
function tsPartial(type) {
  return `Partial<${type}>`;
}
function tsReadonly(immutable) {
  return immutable ? "readonly " : "";
}
function tsUnionOf(types) {
  if (types.length === 1)
    return `${types[0]}`;
  return `(${types.join(") | (")})`;
}

// src/load.ts
var RED = "[31m";
var RESET = "[0m";
var VIRTUAL_JSON_URL = `file:///_json`;
function parseSchema(schema, type) {
  if (type === "YAML") {
    try {
      return import_js_yaml.default.load(schema);
    } catch (err) {
      throw new Error(`YAML: ${err.toString()}`);
    }
  } else {
    try {
      return JSON.parse(schema);
    } catch (err) {
      throw new Error(`JSON: ${err.toString()}`);
    }
  }
}
function isFile(url) {
  return url.protocol === "file:";
}
function resolveSchema(url) {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return new import_url.URL(url);
  }
  const localPath = import_path.default.isAbsolute(url) ? new import_url.URL("", `file://${url}`) : new import_url.URL(url, `file://${process.cwd()}/`);
  if (!import_fs.default.existsSync(localPath)) {
    throw new Error(`Could not locate ${url}`);
  } else if (import_fs.default.statSync(localPath).isDirectory()) {
    throw new Error(`${localPath} is a directory not a file`);
  }
  return localPath;
}
function parseHttpHeaders(httpHeaders) {
  const finalHeaders = {};
  for (const [k, v] of Object.entries(httpHeaders)) {
    if (typeof v === "string") {
      finalHeaders[k] = v;
    } else {
      try {
        const stringVal = JSON.stringify(v);
        finalHeaders[k] = stringVal;
      } catch (err) {
        console.error(`${RED}Cannot parse key: ${k} into JSON format. Continuing with the next HTTP header that is specified${RESET}`);
      }
    }
  }
  return finalHeaders;
}
async function load(schema, options) {
  const urlCache = options.urlCache || /* @__PURE__ */ new Set();
  const isJSON = schema instanceof import_url.URL === false;
  let schemaID = isJSON ? new import_url.URL(VIRTUAL_JSON_URL).href : schema.href;
  const schemas = options.schemas;
  if (isJSON) {
    schemas[schemaID] = schema;
  } else {
    if (urlCache.has(schemaID))
      return options.schemas;
    urlCache.add(schemaID);
    let contents = "";
    let contentType = "";
    const schemaURL = schema;
    if (isFile(schemaURL)) {
      contents = import_fs.default.readFileSync(schemaURL, "utf8");
      contentType = import_mime.default.getType(schemaID) || "";
    } else {
      const headers = {
        "User-Agent": "openapi-typescript"
      };
      if (options.auth)
        headers.Authorization = options.auth;
      if (options.httpHeaders) {
        const parsedHeaders = parseHttpHeaders(options.httpHeaders);
        for (const [k, v] of Object.entries(parsedHeaders)) {
          headers[k] = v;
        }
      }
      const res = await (0, import_node_fetch.default)(schemaID, { method: options.httpMethod || "GET", headers });
      contentType = res.headers.get("Content-Type") || "";
      contents = await res.text();
    }
    const isYAML = contentType === "application/openapi+yaml" || contentType === "text/yaml";
    const isJSON2 = contentType === "application/json" || contentType === "application/json5" || contentType === "application/openapi+json";
    if (isYAML) {
      schemas[schemaID] = parseSchema(contents, "YAML");
    } else if (isJSON2) {
      schemas[schemaID] = parseSchema(contents, "JSON");
    } else {
      try {
        schemas[schemaID] = parseSchema(contents, "JSON");
      } catch (err1) {
        try {
          schemas[schemaID] = parseSchema(contents, "YAML");
        } catch (err2) {
          throw new Error(`Unknown format${contentType ? `: "${contentType}"` : ""}. Only YAML or JSON supported.`);
        }
      }
    }
  }
  const refPromises = [];
  schemas[schemaID] = JSON.parse(JSON.stringify(schemas[schemaID]), (k, v) => {
    if (k !== "$ref" || typeof v !== "string")
      return v;
    const { url: refURL } = parseRef(v);
    if (refURL) {
      const isRemoteURL = refURL.startsWith("http://") || refURL.startsWith("https://");
      if (isJSON && !isRemoteURL) {
        throw new Error(`Can\u2019t load URL "${refURL}" from dynamic JSON. Load this schema from a URL instead.`);
      }
      const nextURL = isRemoteURL ? new import_url.URL(refURL) : new import_url.URL(refURL, schema);
      refPromises.push(load(nextURL, { ...options, urlCache }).then((subschemas) => {
        for (const subschemaURL of Object.keys(subschemas)) {
          schemas[subschemaURL] = subschemas[subschemaURL];
        }
      }));
      return v.replace(refURL, nextURL.href);
    }
    return v;
  });
  await Promise.all(refPromises);
  if (schemaID === options.rootURL.href) {
    for (const subschemaURL of Object.keys(schemas)) {
      schemas[subschemaURL] = JSON.parse(JSON.stringify(schemas[subschemaURL]), (k, v) => {
        if (k !== "$ref" || typeof v !== "string")
          return v;
        if (!v.includes("#"))
          return v;
        const { url, parts } = parseRef(v);
        if (url && new import_url.URL(url).href !== options.rootURL.href) {
          const relativeURL = isFile(new import_url.URL(url)) && isFile(options.rootURL) ? import_path.default.posix.relative(import_path.default.posix.dirname(options.rootURL.href), url) : url;
          return `external["${relativeURL}"]["${parts.join('"]["')}"]`;
        }
        if (!url && subschemaURL !== options.rootURL.href) {
          const relativeURL = isFile(new import_url.URL(subschemaURL)) && isFile(options.rootURL) ? import_path.default.posix.relative(import_path.default.posix.dirname(options.rootURL.href), subschemaURL) : subschemaURL;
          return `external["${relativeURL}"]["${parts.join('"]["')}"]`;
        }
        if (parts[parts.length - 2] === "properties") {
          parts.splice(parts.length - 2, 1);
        }
        const [base, ...rest] = parts;
        return `${base}["${rest.join('"]["')}"]`;
      });
      if (subschemaURL !== options.rootURL.href) {
        const relativeURL = isFile(new import_url.URL(subschemaURL)) && isFile(options.rootURL) ? import_path.default.posix.relative(import_path.default.posix.dirname(options.rootURL.href), subschemaURL) : subschemaURL;
        if (relativeURL !== subschemaURL) {
          schemas[relativeURL] = schemas[subschemaURL];
          delete schemas[subschemaURL];
        }
      }
    }
  }
  return schemas;
}

// src/transform/schema.ts
function hasDefaultValue(node) {
  if (node.hasOwnProperty("default"))
    return true;
  return false;
}
function transformSchemaObjMap(obj, options) {
  let output = "";
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    const comment2 = prepareComment(v);
    if (comment2)
      output += comment2;
    const readonly = tsReadonly(options.immutableTypes);
    const required = options.required.has(k) || options.defaultNonNullable && hasDefaultValue(v.schema || v) ? "" : "?";
    output += `${readonly}"${k}"${required}: `;
    output += transformSchemaObj(v.schema || v, options);
    output += `;
`;
  }
  return output.replace(/\n+$/, "\n");
}
function addRequiredProps(properties, required) {
  const missingRequired = [...required].filter((r) => !(r in properties));
  if (missingRequired.length == 0) {
    return [];
  }
  let output = "";
  for (const r of missingRequired) {
    output += `${r}: unknown;
`;
  }
  return [`{
${output}}`];
}
function transformAnyOf(anyOf, options) {
  const schemas = anyOf.filter((s) => {
    if (Object.keys(s).length > 1)
      return true;
    if (s.required)
      return false;
    return true;
  });
  if (schemas.length === 0) {
    return "";
  }
  return tsIntersectionOf(schemas.map((s) => tsPartial(transformSchemaObj(s, options))));
}
function transformOneOf(oneOf, options) {
  return tsUnionOf(oneOf.map((value) => transformSchemaObj(value, options)));
}
function transformSchemaObj(node, options) {
  var _a;
  const readonly = tsReadonly(options.immutableTypes);
  let output = "";
  const overriddenType = options.formatter && options.formatter(node);
  if (node.nullable) {
    output += "(";
  }
  if (overriddenType) {
    output += overriddenType;
  } else {
    switch (nodeType(node)) {
      case "ref": {
        output += node.$ref;
        break;
      }
      case "string":
      case "number":
      case "boolean":
      case "unknown": {
        output += nodeType(node);
        break;
      }
      case "enum": {
        const items = [];
        node.enum.forEach((item) => {
          if (typeof item === "string")
            items.push(`'${item.replace(/'/g, "\\'")}'`);
          else if (typeof item === "number" || typeof item === "boolean")
            items.push(item);
          else if (item === null && !node.nullable)
            items.push("null");
        });
        output += tsUnionOf(items);
        break;
      }
      case "object": {
        const isAnyOfOrOneOfOrAllOf = "anyOf" in node || "oneOf" in node || "allOf" in node;
        const missingRequired = addRequiredProps(node.properties || {}, node.required || []);
        if (!isAnyOfOrOneOfOrAllOf && (!node.properties || !Object.keys(node.properties).length) && !node.additionalProperties) {
          const emptyObj = `{ ${readonly}[key: string]: unknown }`;
          output += tsIntersectionOf([emptyObj, ...missingRequired]);
          break;
        }
        let properties = transformSchemaObjMap(node.properties || {}, {
          ...options,
          required: new Set(node.required || [])
        });
        let additionalProperties;
        if (node.additionalProperties || node.additionalProperties === void 0 && options.additionalProperties && options.version === 3) {
          if (((_a = node.additionalProperties) != null ? _a : true) === true || Object.keys(node.additionalProperties).length === 0) {
            additionalProperties = `{ ${readonly}[key: string]: unknown }`;
          } else if (typeof node.additionalProperties === "object") {
            const oneOf = node.additionalProperties.oneOf || void 0;
            const anyOf = node.additionalProperties.anyOf || void 0;
            if (oneOf) {
              additionalProperties = `{ ${readonly}[key: string]: ${transformOneOf(oneOf, options)}; }`;
            } else if (anyOf) {
              additionalProperties = `{ ${readonly}[key: string]: ${transformAnyOf(anyOf, options)}; }`;
            } else {
              additionalProperties = `{ ${readonly}[key: string]: ${transformSchemaObj(node.additionalProperties, options) || "unknown"}; }`;
            }
          }
        }
        output += tsIntersectionOf([
          ...node.allOf ? node.allOf.map((node2) => transformSchemaObj(node2, options)) : [],
          ...node.anyOf ? [transformAnyOf(node.anyOf, options)] : [],
          ...node.oneOf ? [transformOneOf(node.oneOf, options)] : [],
          ...properties ? [`{
${properties}
}`] : [],
          ...missingRequired,
          ...additionalProperties ? [additionalProperties] : []
        ]);
        break;
      }
      case "array": {
        if (Array.isArray(node.items)) {
          output += `${readonly}${tsTupleOf(node.items.map((node2) => transformSchemaObj(node2, options)))}`;
        } else {
          output += `${readonly}${tsArrayOf(node.items ? transformSchemaObj(node.items, options) : "unknown")}`;
        }
        break;
      }
    }
  }
  if (node.nullable) {
    output += ") | null";
  }
  return output;
}

// src/transform/headers.ts
function transformHeaderObjMap(headerMap, options) {
  let output = "";
  for (const k of Object.keys(headerMap)) {
    const v = headerMap[k];
    if (!v.schema)
      continue;
    if (v.description)
      output += comment(v.description);
    const readonly = tsReadonly(options.immutableTypes);
    const required = v.required ? "" : "?";
    output += `  ${readonly}"${k}"${required}: ${transformSchemaObj(v.schema, options)}
`;
  }
  return output;
}

// src/transform/parameters.ts
function transformParametersArray(parameters, options) {
  const { globalParameters = {}, ...ctx } = options;
  const readonly = tsReadonly(ctx.immutableTypes);
  let output = "";
  let mappedParams = {};
  for (const paramObj of parameters) {
    if (paramObj.$ref && globalParameters) {
      const paramName = paramObj.$ref.split('["').pop().replace(/"\]$/, "");
      if (globalParameters[paramName]) {
        const reference = globalParameters[paramName];
        if (!mappedParams[reference.in])
          mappedParams[reference.in] = {};
        switch (ctx.version) {
          case 3: {
            mappedParams[reference.in][reference.name || paramName] = {
              ...reference,
              schema: { $ref: paramObj.$ref }
            };
            break;
          }
          case 2: {
            mappedParams[reference.in][reference.name || paramName] = {
              ...reference,
              $ref: paramObj.$ref
            };
            break;
          }
        }
      }
      continue;
    }
    if (!paramObj.in || !paramObj.name)
      continue;
    if (!mappedParams[paramObj.in])
      mappedParams[paramObj.in] = {};
    mappedParams[paramObj.in][paramObj.name] = paramObj;
  }
  for (const [paramIn, paramGroup] of Object.entries(mappedParams)) {
    output += `  ${readonly}${paramIn}: {
`;
    for (const [paramName, paramObj] of Object.entries(paramGroup)) {
      let paramComment = "";
      if (paramObj.deprecated)
        paramComment += `@deprecated `;
      if (paramObj.description)
        paramComment += paramObj.description;
      if (paramComment)
        output += comment(paramComment);
      const required = paramObj.required ? `` : `?`;
      let paramType = ``;
      switch (ctx.version) {
        case 3: {
          paramType = paramObj.schema ? transformSchemaObj(paramObj.schema, { ...ctx, required: /* @__PURE__ */ new Set() }) : "unknown";
          break;
        }
        case 2: {
          if (paramObj.in === "body" && paramObj.schema) {
            paramType = transformSchemaObj(paramObj.schema, { ...ctx, required: /* @__PURE__ */ new Set() });
          } else if (paramObj.type) {
            paramType = transformSchemaObj(paramObj, { ...ctx, required: /* @__PURE__ */ new Set() });
          } else {
            paramType = "unknown";
          }
          break;
        }
      }
      output += `    ${readonly}"${paramName}"${required}: ${paramType};
`;
    }
    output += `  }
`;
  }
  return output;
}

// src/transform/request.ts
function transformRequestBodies(requestBodies, ctx) {
  let output = "";
  for (const [name, requestBody] of Object.entries(requestBodies)) {
    if (requestBody && requestBody.description)
      output += `  ${comment(requestBody.description)}`;
    output += `  "${name}": {
    ${transformRequestBodyObj(requestBody, ctx)}
  }
`;
  }
  return output;
}
function transformRequestBodyObj(requestBody, ctx) {
  const readonly = tsReadonly(ctx.immutableTypes);
  let output = "";
  if (requestBody.content && Object.keys(requestBody.content).length) {
    output += `  ${readonly}content: {
`;
    for (const [k, v] of Object.entries(requestBody.content)) {
      output += `      ${readonly}"${k}": ${transformSchemaObj(v.schema, { ...ctx, required: /* @__PURE__ */ new Set() })};
`;
    }
    output += `    }
`;
  } else {
    output += `  unknown;
`;
  }
  return output;
}

// src/transform/responses.ts
var resType = (res) => res === 204 || res >= 300 && res < 400 ? "never" : "unknown";
function transformResponsesObj(responsesObj, ctx) {
  const readonly = tsReadonly(ctx.immutableTypes);
  let output = "";
  for (const httpStatusCode of Object.keys(responsesObj)) {
    const statusCode = Number(httpStatusCode) || `"${httpStatusCode}"`;
    const response = responsesObj[httpStatusCode];
    if (response.description)
      output += comment(response.description);
    if (response.$ref) {
      output += `  ${readonly}${statusCode}: ${response.$ref};
`;
      continue;
    }
    if (!response.content && !response.schema || response.content && !Object.keys(response.content).length) {
      output += `  ${readonly}${statusCode}: ${resType(statusCode)};
`;
      continue;
    }
    output += `  ${readonly}${statusCode}: {
`;
    if (response.headers && Object.keys(response.headers).length) {
      if (response.headers.$ref) {
        output += `    ${readonly}headers: ${response.headers.$ref};
`;
      } else {
        output += `    ${readonly}headers: {
      ${transformHeaderObjMap(response.headers, {
          ...ctx,
          required: /* @__PURE__ */ new Set()
        })}
    }
`;
      }
    }
    switch (ctx.version) {
      case 3: {
        output += `    ${readonly}content: {
`;
        for (const contentType of Object.keys(response.content)) {
          const contentResponse = response.content[contentType];
          const responseType = contentResponse && (contentResponse == null ? void 0 : contentResponse.schema) ? transformSchemaObj(contentResponse.schema, { ...ctx, required: /* @__PURE__ */ new Set() }) : "unknown";
          output += `      ${readonly}"${contentType}": ${responseType};
`;
        }
        output += ` }
`;
        break;
      }
      case 2: {
        output += `  ${readonly} schema: ${transformSchemaObj(response.schema, {
          ...ctx,
          required: /* @__PURE__ */ new Set()
        })};
`;
        break;
      }
    }
    output += `  }
`;
  }
  return output;
}

// src/transform/operation.ts
function transformOperationObj(operation, options) {
  const { pathItem = {}, globalParameters, ...ctx } = options;
  const readonly = tsReadonly(ctx.immutableTypes);
  let output = "";
  if (operation.parameters || pathItem.parameters) {
    const parameters = (pathItem.parameters || []).concat(operation.parameters || []);
    output += `  ${readonly}parameters: {
    ${transformParametersArray(parameters, {
      ...ctx,
      globalParameters
    })}
  }
`;
  }
  if (operation.responses) {
    output += `  ${readonly}responses: {
    ${transformResponsesObj(operation.responses, ctx)}
  }
`;
  }
  if (operation.requestBody) {
    if (isRef(operation.requestBody)) {
      output += `  ${readonly}requestBody: ${operation.requestBody.$ref};
`;
    } else {
      if (operation.requestBody.description)
        output += comment(operation.requestBody.description);
      output += `  ${readonly}requestBody: {
  ${transformRequestBodyObj(operation.requestBody, ctx)}  }
`;
    }
  }
  return output;
}

// src/transform/paths.ts
function transformPathsObj(paths, options) {
  const { globalParameters, operations, ...ctx } = options;
  const readonly = tsReadonly(ctx.immutableTypes);
  let output = "";
  for (const [url, pathItem] of Object.entries(paths)) {
    if (pathItem.description)
      output += comment(pathItem.description);
    if (pathItem.$ref) {
      output += `  ${readonly}"${url}": ${pathItem.$ref};
`;
      continue;
    }
    output += ` ${readonly}"${url}": {
`;
    for (const method of ["get", "put", "post", "delete", "options", "head", "patch", "trace"]) {
      const operation = pathItem[method];
      if (!operation)
        continue;
      if (operation.description)
        output += comment(operation.description);
      if (operation.operationId) {
        operations[operation.operationId] = { operation, pathItem };
        const namespace = ctx.namespace ? `external["${ctx.namespace}"]["operations"]` : `operations`;
        output += `    ${readonly}"${method}": ${namespace}["${operation.operationId}"];
`;
      } else {
        output += `    ${readonly}"${method}": {
      ${transformOperationObj(operation, {
          ...ctx,
          globalParameters,
          pathItem
        })}
    }
`;
      }
    }
    if (pathItem.parameters) {
      output += `   ${readonly}parameters: {
      ${transformParametersArray(pathItem.parameters, {
        ...ctx,
        globalParameters
      })}
    }
`;
    }
    output += `  }
`;
  }
  return output;
}

// src/transform/index.ts
function transformAll(schema, ctx) {
  const readonly = tsReadonly(ctx.immutableTypes);
  let output = {};
  let operations = {};
  if (ctx.rawSchema) {
    const required = new Set(Object.keys(schema));
    switch (ctx.version) {
      case 2: {
        output.definitions = transformSchemaObjMap(schema, { ...ctx, required });
        return output;
      }
      case 3: {
        output.schemas = transformSchemaObjMap(schema, { ...ctx, required });
        return output;
      }
    }
  }
  output.paths = "";
  if (schema.paths) {
    output.paths += transformPathsObj(schema.paths, {
      ...ctx,
      globalParameters: schema.components && schema.components.parameters || schema.parameters,
      operations
    });
  }
  switch (ctx.version) {
    case 2: {
      if (schema.definitions) {
        output.definitions = transformSchemaObjMap(schema.definitions, {
          ...ctx,
          required: new Set(Object.keys(schema.definitions))
        });
      }
      if (schema.parameters) {
        output.parameters = transformSchemaObjMap(schema.parameters, {
          ...ctx,
          required: new Set(Object.keys(schema.parameters))
        });
      }
      if (schema.responses) {
        output.responses = transformResponsesObj(schema.responses, ctx);
      }
      break;
    }
    case 3: {
      output.components = "";
      if (schema.components) {
        if (schema.components.schemas) {
          output.components += `  ${readonly}schemas: {
    ${transformSchemaObjMap(schema.components.schemas, {
            ...ctx,
            required: new Set(Object.keys(schema.components.schemas))
          })}
  }
`;
        }
        if (schema.components.responses) {
          output.components += `  ${readonly}responses: {
    ${transformResponsesObj(schema.components.responses, ctx)}
  }
`;
        }
        if (schema.components.parameters) {
          output.components += `  ${readonly}parameters: {
    ${transformSchemaObjMap(schema.components.parameters, {
            ...ctx,
            required: new Set(Object.keys(schema.components.parameters))
          })}
  }
`;
        }
        if (schema.components.requestBodies) {
          output.components += `  ${readonly}requestBodies: {
    ${transformRequestBodies(schema.components.requestBodies, ctx)}
  }
`;
        }
        if (schema.components.headers) {
          output.components += `  ${readonly}headers: {
    ${transformHeaderObjMap(schema.components.headers, {
            ...ctx,
            required: /* @__PURE__ */ new Set()
          })}
  }
`;
        }
      }
      break;
    }
  }
  output.operations = "";
  if (Object.keys(operations).length) {
    for (const id of Object.keys(operations)) {
      const { operation, pathItem } = operations[id];
      if (operation.description)
        output.operations += comment(operation.description);
      output.operations += `  ${readonly}"${id}": {
    ${transformOperationObj(operation, {
        ...ctx,
        pathItem,
        globalParameters: schema.components && schema.components.parameters || schema.parameters
      })}
  }
`;
    }
  }
  for (const k of Object.keys(output)) {
    if (typeof output[k] === "string") {
      output[k] = output[k].trim();
    }
  }
  return output;
}

// src/index.ts
var WARNING_MESSAGE = `/**
* This file was auto-generated by openapi-typescript.
* Do not make direct changes to the file.
*/


`;
async function openapiTS(schema, options = {}) {
  const ctx = {
    additionalProperties: options.additionalProperties || false,
    auth: options.auth,
    defaultNonNullable: options.defaultNonNullable || false,
    formatter: options && typeof options.formatter === "function" ? options.formatter : void 0,
    immutableTypes: options.immutableTypes || false,
    rawSchema: options.rawSchema || false,
    version: options.version || 3
  };
  const isInlineSchema = typeof schema != "string" && schema instanceof import_url2.URL == false;
  let rootSchema = {};
  let external = {};
  const allSchemas = {};
  const schemaURL = typeof schema === "string" ? resolveSchema(schema) : schema;
  await load(schemaURL, {
    ...ctx,
    schemas: allSchemas,
    rootURL: isInlineSchema ? new import_url2.URL(VIRTUAL_JSON_URL) : schemaURL,
    httpHeaders: options.httpHeaders,
    httpMethod: options.httpMethod
  });
  for (const k of Object.keys(allSchemas)) {
    const rootSchemaID = isInlineSchema ? VIRTUAL_JSON_URL : schemaURL.href;
    if (k === rootSchemaID) {
      rootSchema = allSchemas[k];
    } else {
      external[k] = allSchemas[k];
    }
  }
  let output = WARNING_MESSAGE;
  if (!(options == null ? void 0 : options.version) && !ctx.rawSchema)
    ctx.version = swaggerVersion(rootSchema);
  const rootTypes = transformAll(rootSchema, { ...ctx });
  for (const k of Object.keys(rootTypes)) {
    if (typeof rootTypes[k] === "string") {
      output += `export interface ${k} {
  ${rootTypes[k]}
}

`;
    }
  }
  output += `export interface external {
`;
  const externalKeys = Object.keys(external);
  externalKeys.sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
  for (const subschemaURL of externalKeys) {
    output += `  "${subschemaURL}": {
`;
    const subschemaTypes = transformAll(external[subschemaURL], { ...ctx, namespace: subschemaURL });
    for (const k of Object.keys(subschemaTypes)) {
      output += `    "${k}": {
      ${subschemaTypes[k]}
    }
`;
    }
    output += `  }
`;
  }
  output += `}

`;
  let prettierOptions = {
    parser: "typescript",
    plugins: [import_parser_typescript.default]
  };
  if (options && options.prettierConfig) {
    try {
      const userOptions = await import_prettier.default.resolveConfig(import_path2.default.resolve(process.cwd(), options.prettierConfig));
      prettierOptions = {
        ...userOptions || {},
        ...prettierOptions,
        plugins: [...prettierOptions.plugins, ...userOptions && userOptions.plugins || []]
      };
    } catch (err) {
      console.error(`\u274C ${err}`);
    }
  }
  return import_prettier.default.format(output, prettierOptions);
}
var src_default = openapiTS;
module.exports = __toCommonJS(src_exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  WARNING_MESSAGE
});

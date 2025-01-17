export function prepareComment(v) {
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
export function comment(text) {
    const commentText = text.trim().replace(/\*\//g, "*\\/");
    if (commentText.indexOf("\n") === -1) {
        return `/** ${commentText} */\n`;
    }
    return `/**
  * ${commentText.replace(/\r?\n/g, "\n  * ")}
  */\n`;
}
export function parseRef(ref) {
    if (typeof ref !== "string" || !ref.includes("#"))
        return { parts: [] };
    const [url, parts] = ref.split("#");
    return {
        url: url || undefined,
        parts: parts
            .split("/")
            .filter((p) => !!p)
            .map(decodeRef),
    };
}
export function isRef(obj) {
    return !!obj.$ref;
}
export function nodeType(obj) {
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
    if (obj.type === "object" ||
        obj.hasOwnProperty("allOf") ||
        obj.hasOwnProperty("anyOf") ||
        obj.hasOwnProperty("oneOf") ||
        obj.hasOwnProperty("properties") ||
        obj.hasOwnProperty("additionalProperties")) {
        return "object";
    }
    return "unknown";
}
export function swaggerVersion(definition) {
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
    throw new Error(`✘  version missing from schema; specify whether this is OpenAPI v3 or v2 https://swagger.io/specification`);
}
export function decodeRef(ref) {
    return ref.replace(/\~0/g, "~").replace(/\~1/g, "/").replace(/"/g, '\\"');
}
export function encodeRef(ref) {
    return ref.replace(/\~/g, "~0").replace(/\//g, "~1");
}
export function tsArrayOf(type) {
    return `(${type})[]`;
}
export function tsTupleOf(types) {
    return `[${types.join(", ")}]`;
}
export function tsIntersectionOf(types) {
    const typesWithValues = types.filter(Boolean);
    if (typesWithValues.length === 1)
        return typesWithValues[0];
    return `(${typesWithValues.join(") & (")})`;
}
export function tsPartial(type) {
    return `Partial<${type}>`;
}
export function tsReadonly(immutable) {
    return immutable ? "readonly " : "";
}
export function tsUnionOf(types) {
    if (types.length === 1)
        return `${types[0]}`;
    return `(${types.join(") | (")})`;
}
//# sourceMappingURL=utils.js.map
const pathToRegexp = require("path-to-regexp");

function generateConfig({ config, routes }) {
  const apiObject = {
    openapi: "3.0.0",
    ...(config || {})
  };

  apiObject.paths = {};

  for (const route of routes) {
    if (route.schema && route.schema.hide) {
      continue;
    }

    const path = pathToRegexp
      .parse(route.url)
      .map(x => (typeof x == "object" ? `${x.prefix}{${x.name}}` : x))
      .join("");

    const pathObject = apiObject.paths[path] || {};

    const methodDefinition = parseSchemaToMethod(route.schema);

    const httpMethods = [].concat(route.method);

    for (var method of httpMethods) {
      pathObject[method.toLowerCase()] = methodDefinition;
    }

    apiObject.paths[path] = pathObject;
  }

  return apiObject;
}

function parseRequestBody(schema) {
  if (schema.body == null) {
    return;
  }

  const mimeTypes = schema.consumes || ["application/json"];

  const requestBody = {
    content: {}
  };

  for (const mimeType of mimeTypes) {
    requestBody.content[mimeType] = {
      schema: schema.body
    };
  }

  return requestBody;
}

function openApi3Responses(schema) {
  const result = {};

  if (schema.response != null) {
    for (const httpCode in schema.response) {
      const responseDefinition = schema.response[httpCode];

      result[httpCode] = {
        description: responseDefinition.description
      };

      if (responseDefinition.type != null) {
        result[httpCode].content = {
          "application/json": {
            schema: responseDefinition
          }
        };
      }
    }
  }

  return result;
}

function parseSchemaToMethod(schema) {
  if (schema == null) {
    return {
      summary: ""
    };
  }

  return {
    operationId: schema.operationId,
    summary: schema.summary,
    description: schema.description,
    deprecated: schema.deprecated,
    security: schema.security,
    requestBody: parseRequestBody(schema),
    responses: openApi3Responses(schema),
    parameters: [
      ...parseParams(schema.params).map(addIn("path")),
      ...parseParams(schema.querystring).map(addIn("query")),
      ...parseParams(schema.headers).map(addIn("header"))
    ],
    tags: schema.tags
  };
}

function addIn(inValue) {
  function mapper(obj) {
    return {
      ...obj,
      in: inValue
    };
  }

  return mapper;
}

function parseParams(params) {
  if (params == null) {
    return [];
  }

  if (!params.properties) {
    return parseParams({
      properties: params
    });
  }

  return Object.keys(params.properties).map(name => {
    return {
      name,
      schema: params.properties[name] || {},
      required: params.required && params.required.includes(name)
    };
  });
}

module.exports = {
  generateConfig
};

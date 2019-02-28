const { validate } = require("openapi-schema-validation");
const yaml = require("js-yaml");

const { generateConfig } = require("../openapi3");

function testRoute(route, useBaseConfig = true) {
  const config = generateConfig({
    routes: [route].filter(Boolean),
    config: useBaseConfig
      ? {
          info: {
            title: "Test",
            version: "0.0.0"
          }
        }
      : null
  });

  validate(config, 3);

  expect(yaml.safeDump(config, { skipInvalid: true })).toMatchSnapshot();
}

describe("Fastify UI", () => {
  describe("Open API 3 generator", () => {
    test("empty config", () => {
      testRoute(null, false);
    });

    test("simple route without schema", () => {
      testRoute({
        method: "POST",
        url: "/test/:random",
        handler: jest.fn()
      });
    });

    test("simple route with a schema just to hide it", () => {
      testRoute({
        method: "POST",
        url: "/test/:random",
        schema: {
          hide: true
        },
        handler: jest.fn()
      });
    });

    test("simple route using the shorthand syntax", () => {
      testRoute({
        method: "POST",
        url: "/test/:random",
        schema: {
          params: {
            random: { type: "string" }
          }
        },
        handler: jest.fn()
      });
    });

    test("advanced route", () => {
      testRoute({
        method: "POST",
        url: "/test/:random",
        schema: {
          operationId: "testMethod",
          summary: "Tests the basic features",
          params: {
            required: ["random"],
            type: "object",
            properties: {
              random: { type: "string" }
            }
          },
          body: {
            type: "object",
            properties: {
              name: { type: "string" },
              profession: { type: "string" }
            }
          },
          response: {
            200: {
              description: "The test ran successfully.",
              type: "object",
              properties: {
                success: {
                  type: "boolean"
                }
              }
            },
            500: {
              description: "An error occurred."
            }
          },
          security: [
            {
              bearerAuth: ["tests:run"]
            }
          ]
        },
        handler: jest.fn()
      });
    });
  });
});

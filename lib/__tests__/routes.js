const openApiUI = require("openapi-ui");

const { installRoutes } = require("../routes");
const { serveIndex, sendJson, sendYaml } = require("../routes").__tests__;

jest.mock("openapi-ui");
jest.mock("fastify-static");

openApiUI.generateIndex.mockReturnValue("<body>Dummy index</body>");
openApiUI.getAssetsPath.mockReturnValue("./node_modules/openapi-ui/dist");

const testBaseConfig = {
  info: {
    name: "Test API",
    description: "Performs some unit tests.",
    version: "0.0.0"
  },
  servers: [{ url: "http://localhost:3000" }]
};

describe("Fastify UI", () => {
  describe("Routes", () => {
    test("installs middleware", () => {
      const routes = {};

      const fastify = {
        route: jest.fn(route => {
          routes[`${route.method || "GET"} ${route.url}`] = route;
        }),
        register: jest.fn()
      };

      const next = jest.fn();

      installRoutes(fastify, { config: testBaseConfig, prefix: "/" }, next);

      expect({
        routeCalls: fastify.route.mock.calls,
        registerCalls: fastify.register.mock.calls
      }).toMatchSnapshot();
    });

    test("does not install middleware without config", () => {
      expect(() => {
        installRoutes(null, { prefix: "/" }, null);
      }).toThrowErrorMatchingSnapshot();
    });

    test("does not install middleware without config.info", () => {
      const config = {
        ...testBaseConfig,
        info: null
      };

      expect(() => {
        installRoutes(null, { config, prefix: "/" }, null);
      }).toThrowErrorMatchingSnapshot();
    });

    test("does not install middleware without config.servers", () => {
      const config = {
        ...testBaseConfig,
        servers: null
      };

      expect(() => {
        installRoutes(null, { config, prefix: "/" }, null);
      }).toThrowErrorMatchingSnapshot();
    });

    test("serves index", () => {
      const reply = {
        type: jest.fn(),
        send: jest.fn()
      };

      serveIndex({ prefix: "/", config: testBaseConfig }, null, reply);

      expect(reply.type.mock.calls.length).toBe(1);
      expect(reply.type.mock.calls[0].length).toBe(1);
      expect(reply.type.mock.calls[0][0]).toBe("text/html; charset=utf-8");

      expect(reply.send.mock.calls.length).toBe(1);
      expect(reply.send.mock.calls[0].length).toBe(1);
      expect(reply.send.mock.calls[0][0]).toMatchSnapshot();
    });

    test("serves JSON", () => {
      const fastify = {
        apiConfig: jest.fn().mockReturnValue(testBaseConfig)
      };

      const reply = {
        send: jest.fn()
      };

      sendJson({ fastify }, null, reply);

      expect(fastify.apiConfig.mock.calls.length).toBe(1);
      expect(fastify.apiConfig.mock.calls[0].length).toBe(0);

      expect(reply.send.mock.calls.length).toBe(1);
      expect(reply.send.mock.calls[0].length).toBe(1);
      expect(reply.send.mock.calls[0][0]).toMatchSnapshot();
    });

    test("serves YAML", () => {
      const fastify = {
        apiConfig: jest.fn().mockReturnValue(testBaseConfig)
      };

      const reply = {
        type: jest.fn(),
        send: jest.fn()
      };

      sendYaml({ fastify }, null, reply);

      expect(fastify.apiConfig.mock.calls.length).toBe(1);
      expect(fastify.apiConfig.mock.calls[0].length).toBe(0);

      expect(reply.type.mock.calls.length).toBe(1);
      expect(reply.type.mock.calls[0].length).toBe(1);
      expect(reply.type.mock.calls[0][0]).toBe("application/x-yaml");

      expect(reply.send.mock.calls.length).toBe(1);
      expect(reply.send.mock.calls[0].length).toBe(1);
      expect(reply.send.mock.calls[0][0]).toMatchSnapshot();
    });
  });
});

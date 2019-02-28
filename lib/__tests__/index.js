const installUI = require("..");
const { addRoute, redirect } = require("..").__tests__;

jest.mock("../openapi3");
jest.mock("../routes", () => jest.fn().mockName("installRoutes"));

describe("Fastify UI", () => {
  describe("Routes", () => {
    test("installs middleware", () => {
      const fastify = {
        addHook: jest.fn(),
        decorate: jest.fn(),
        register: jest.fn()
      };

      const next = jest.fn();

      installUI(fastify, {}, next);
    });

    test("addRoute", () => {
      const routes = {
        push: jest.fn()
      };

      const testRoute = {
        method: "POST",
        url: "/test"
      };

      addRoute({ routes }, testRoute, { discardedData: true });

      expect(routes.push.mock.calls.length).toBe(1);
      expect(routes.push.mock.calls[0].length).toBe(1);
      expect(routes.push.mock.calls[0][0]).toBe(testRoute);
    });

    test("redirect", () => {
      const reply = {
        redirect: jest.fn()
      };

      const publicPath = "/docs/";

      redirect({ publicPath }, null, reply);

      expect(reply.redirect.mock.calls.length).toBe(1);
      expect(reply.redirect.mock.calls[0].length).toBe(1);
      expect(reply.redirect.mock.calls[0][0]).toBe(publicPath);
    });

    test("adds redirect if publicPath ends in /", () => {
      const fastify = {
        addHook: jest.fn(),
        decorate: jest.fn(),
        register: jest.fn(),
        get: jest.fn()
      };

      const next = jest.fn();

      installUI(fastify, { publicPath: "/docs/" }, next);

      expect(fastify.get.mock.calls.length).toBe(1);
      expect(fastify.get.mock.calls[0][0]).toBe("/docs");
      expect(fastify.get.mock.calls[0][1].schema.hide).toBe(true);
      expect(typeof fastify.get.mock.calls[0][2]).toBe("function");
      expect(fastify.get.mock.calls[0].length).toBe(3);
    });
  });
});

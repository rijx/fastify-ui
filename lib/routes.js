const openApiUI = require("openapi-ui");
const staticHandler = require("fastify-static");
const yaml = require("js-yaml");

function serveIndex({ prefix, config }, request, reply) {
  reply.type("text/html; charset=utf-8");
  reply.send(
    openApiUI.generateIndex({
      baseUrl: `${prefix.replace(/\/$/, "")}/`,
      title: config.info.title,
      url: `${config.servers[0].url}${prefix.replace(/\/$/, "")}/json`
    })
  );
}

function sendJson({ fastify }, request, reply) {
  reply.send(fastify.apiConfig());
}

function sendYaml({ fastify }, request, reply) {
  reply.type("application/x-yaml");
  reply.send(yaml.safeDump(fastify.apiConfig(), { skipInvalid: true }));
}

function installRoutes(fastify, { config, prefix }, next) {
  if (config == null) {
    throw new Error("Your UI should at least have a { config } signature");
  }

  if (
    config.info == null ||
    config.info.name == null ||
    config.info.version == null
  ) {
    throw new Error(
      "Your UI should at least have a { config: { info: { name, version } } } signature"
    );
  }

  if (
    config.servers == null ||
    config.servers[0] == null ||
    config.servers[0].url == null
  ) {
    throw new Error(
      "Your UI should at least have a { config: { servers: [{ url }] } } signature"
    );
  }

  fastify.route({
    url: "/",
    method: "GET",
    schema: { hide: true },
    handler: serveIndex.bind(null, { config, prefix })
  });

  fastify.route({
    url: "/json",
    method: "GET",
    schema: { hide: true },
    handler: sendJson.bind(null, { fastify })
  });

  fastify.route({
    url: "/yaml",
    method: "GET",
    schema: { hide: true },
    handler: sendYaml.bind(null, { fastify })
  });

  fastify.register(staticHandler, {
    root: openApiUI.getAssetsPath()
  });

  next();
}

module.exports = {
  installRoutes,
  __tests__: {
    serveIndex,
    sendJson,
    sendYaml
  }
};

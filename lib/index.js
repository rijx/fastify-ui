const { generateConfig } = require("./openapi3");
const { installRoutes } = require("./routes");

function addRoute({ routes }, routeOptions) {
  routes.push(routeOptions);
}

function redirect({ publicPath }, request, reply) {
  reply.redirect(publicPath);
}

function installUI(fastify, { config, publicPath }, next) {
  publicPath = publicPath || "/";

  const routes = [];

  fastify.addHook("onRoute", addRoute.bind(null, { routes }));

  fastify.decorate("apiConfig", generateConfig.bind(null, { config, routes }));

  if (publicPath != "/" && publicPath.endsWith("/")) {
    fastify.get(
      publicPath.replace(/\/$/, ""),
      { schema: { hide: true } },
      redirect.bind(null, { publicPath })
    );
  }

  fastify.register(installRoutes, { config, prefix: publicPath });

  next();
}

module.exports = installUI;

module.exports.__tests__ = {
  addRoute,
  redirect
};

# fastify-ui

![build status](https://gitlab.com/rijx/fastify-ui/badges/master/build.svg?style=flat) ![test coverage](https://gitlab.com/rijx/fastify-ui/badges/master/coverage.svg?style=flat) ![npm version](https://img.shields.io/npm/v/fastify-ui.svg)

Makes adding an API UI to your Fastify project a breeze.

## Example

```js
const fastifyUI = require("fastify-ui");

const packageDefinition = require("../package.json");

function installApiUI(fastify) {
  fastify.register(fastifyUI, {
    config: {
      info: {
        title: packageDefinition.name || null,
        description: packageDefinition.description || null,
        version: packageDefinition.version || null
      },
      servers: [
        {
          url: "http://localhost:3000"
        }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer"
          }
        }
      }
    }
  });
}

module.exports = installApiUI;
```

const co = require("co")
const app = require("koa")()
const router = require("koa-router")()
const isa = require("../")
const { mediaTypes } = isa.api

const database = require("./database")

co(function *() {

  // connect to database
  yield database.connect("mongodb://localhost:27017/blog")

  // register media-types
  mediaTypes(mediaTypes.HAL)

  app.use(isa(app,

    // register APIs
    require("./article/articleApi")(router)

  )).listen(3000)

}).catch(error => console.error(error.stack))

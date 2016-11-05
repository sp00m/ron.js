const ron = require("../")
const articleRepository = require("./articleRepository")

module.exports = new class ArticleService extends ron.CrudService {

  constructor(repository) {
    super(repository)
  }

}(articleRepository)

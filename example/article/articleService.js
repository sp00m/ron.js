const { CrudService } = require("../../")
const articleRepository = require("./articleRepository")

module.exports = new class ArticleService extends CrudService {

  constructor(repository) {
    super(repository)
  }

}(articleRepository)

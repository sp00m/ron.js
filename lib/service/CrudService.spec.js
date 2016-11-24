require("co-mocha")

const should = require("should")
const sinon = require("sinon")

const CrudService = require("./CrudService")
const CrudRepository = require("../repository/CrudRepository")

describe("CrudService", () => {

  const actualMethods = Object.getOwnPropertyNames(CrudService.prototype).filter(method => method !== "constructor")
  const expectedMethodsParameters = {
    findOneById: [42],
    find: [],
    insertOne: [{}, true],
    replaceOneById: [42, {}, true],
    updateOneById: [42, {}, true],
    deleteOneById: [42, true],
    deleteMany: [true]
  }
  const expectedMethods = Object.keys(expectedMethodsParameters)

  const _verifyServiceMethodCall = function *(service, repository, methodName, parameters) {
    let spy = sinon.spy(repository, methodName)
    spy = spy.withArgs.apply(spy, parameters)
    const result = yield service[methodName].apply(service, parameters)
    result.should.eql(parameters)
    spy.calledOnce.should.be.true()
  }

  it("should not be instantiable", function *() {
    let instantiated = false
    try {
      new CrudService()
      instantiated = true
    } catch (error) {
      error.should.be.an.instanceOf(TypeError)
      error.message.should.equal("Cannot instantiate CrudService")
    } finally {
      instantiated.should.be.false()
    }
  })

  it("should not accept an argument that is not an instance of CrudRepository", function *() {
    let instantiated = false
    try {
      new class extends CrudService {}
      instantiated = true
    } catch (error) {
      error.should.be.an.instanceOf(TypeError)
      error.message.should.equal("repository must be an instance of CrudRepository")
    } finally {
      instantiated.should.be.false()
    }
  })

  it("should provide only expected CRUD methods", function *() {
    const forgottenExpectedMethods = expectedMethods.filter(method => actualMethods.indexOf(method) < 0)
    forgottenExpectedMethods.should.be.empty()
    const additionalActualMethods = actualMethods.filter(method => expectedMethods.indexOf(method) < 0)
    additionalActualMethods.should.be.empty()
  })

  it("should delegate any method call to enclosed repository", function *() {
    const myRepository = new class MyRepository extends CrudRepository {

      *findOneById(id) {
        return [id]
      }

      *find() {
        return []
      }

      *insertOne(document, returnDocument) {
        return [document, returnDocument]
      }

      *replaceOneById(id, document, returnDocument) {
        return [id, document, returnDocument]
      }

      *updateOneById(id, update, returnDocument) {
        return [id, update, returnDocument]
      }

      *deleteOneById(id, returnDocument) {
        return [id, returnDocument]
      }

      *deleteMany(returnDocuments) {
        return [returnDocuments]
      }

    }
    const myService = new class MyService extends CrudService {

      constructor(repository) {
        super(repository)
      }

    }(myRepository)
    for (const method of expectedMethods) {
      yield _verifyServiceMethodCall(myService, myRepository, method, expectedMethodsParameters[method])
    }
  })

})
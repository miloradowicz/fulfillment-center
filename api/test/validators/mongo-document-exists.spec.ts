/* eslint-disable */

import { MongoDocumentExists } from '../../src/validators/mongo-document-exists'
describe('MongoDocumentExists Validator', () => {
  it('should be defined', () => {
    expect(MongoDocumentExists).toBeDefined()
  })
  it('should return a decorator function', () => {
    class TestModel {}
    const decorator = MongoDocumentExists(TestModel)
    expect(typeof decorator).toBe('function')
  })
  it('should create decorator with parameters', () => {
    class TestModel {}
    const fieldName = 'testField'
    const options = { message: 'Test message' }
    const inverse = false
    const decorator = MongoDocumentExists(TestModel, fieldName, options, inverse)
    expect(typeof decorator).toBe('function')
  })
}) 
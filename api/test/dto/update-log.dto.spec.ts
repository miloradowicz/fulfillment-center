/* eslint-disable */

import { validate } from 'class-validator'
import { UpdateLogDto } from '../../src/dto/update-log.dto'
describe('UpdateLogDto', () => {
  let dto: UpdateLogDto
  beforeEach(() => {
    dto = new UpdateLogDto()
  })
  it('should be defined', () => {
    expect(dto).toBeDefined()
  })
  it('should pass validation with valid data', async () => {
    dto.collection = 'users'
    dto.document = '507f1f77bcf86cd799439011'
    dto.change = 'Updated user name'
    const errors = await validate(dto)
    expect(errors).toHaveLength(0)
  })
  it('should fail validation when collection is empty', async () => {
    dto.collection = ''
    dto.document = '507f1f77bcf86cd799439011'
    dto.change = 'Updated user name'
    const errors = await validate(dto)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('collection')
    expect(errors[0].constraints?.isNotEmpty).toBe('Поле коллекция обязательно.')
  })
  it('should fail validation when collection is not a string', async () => {
    dto.collection = 123 as any
    dto.document = '507f1f77bcf86cd799439011'
    dto.change = 'Updated user name'
    const errors = await validate(dto)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('collection')
    expect(errors[0].constraints?.isString).toBe('Поле коллекция должно быть строкой.')
  })
  it('should fail validation when document is empty', async () => {
    dto.collection = 'users'
    dto.document = ''
    dto.change = 'Updated user name'
    const errors = await validate(dto)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('document')
    expect(errors[0].constraints?.isNotEmpty).toBe('Поле документ обязательно.')
  })
  it('should fail validation when document is not a valid MongoDB ObjectId', async () => {
    dto.collection = 'users'
    dto.document = 'invalid-id'
    dto.change = 'Updated user name'
    const errors = await validate(dto)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('document')
    expect(errors[0].constraints?.isMongoId).toBe('Поле документ должно быть идентификатором Монго.')
  })
  it('should fail validation when change is empty', async () => {
    dto.collection = 'users'
    dto.document = '507f1f77bcf86cd799439011'
    dto.change = ''
    const errors = await validate(dto)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('change')
    expect(errors[0].constraints?.isNotEmpty).toBe('Поле изменения обязательно.')
  })
  it('should fail validation when change is not a string', async () => {
    dto.collection = 'users'
    dto.document = '507f1f77bcf86cd799439011'
    dto.change = 123 as any
    const errors = await validate(dto)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('change')
    expect(errors[0].constraints?.isString).toBe('Поле изменения должно быть строкой.')
  })
  it('should fail validation with multiple errors', async () => {
    dto.collection = ''
    dto.document = 'invalid-id'
    dto.change = ''
    const errors = await validate(dto)
    expect(errors).toHaveLength(3)
    const collectionError = errors.find(error => error.property === 'collection')
    const documentError = errors.find(error => error.property === 'document')
    const changeError = errors.find(error => error.property === 'change')
    expect(collectionError?.constraints?.isNotEmpty).toBe('Поле коллекция обязательно.')
    expect(documentError?.constraints?.isMongoId).toBe('Поле документ должно быть идентификатором Монго.')
    expect(changeError?.constraints?.isNotEmpty).toBe('Поле изменения обязательно.')
  })
}) 
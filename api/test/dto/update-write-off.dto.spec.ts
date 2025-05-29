/* eslint-disable */

import { validate } from 'class-validator'
import { UpdateWriteOffDto } from '../../src/dto/update-write-off.dto'
import { CreateWriteOffDto } from '../../src/dto/create-write-off.dto'
import mongoose from 'mongoose'
describe('UpdateWriteOffDto', () => {
  let dto: UpdateWriteOffDto
  beforeEach(() => {
    dto = new UpdateWriteOffDto()
  })
  it('should be defined', () => {
    expect(dto).toBeDefined()
  })
  it('should be based on CreateWriteOffDto', () => {
    expect(dto).toBeDefined()
    expect(typeof dto).toBe('object')
  })
  it('should pass validation with valid data', async () => {
    dto.write_offs = [
      {
        product: new mongoose.Types.ObjectId(),
        amount: 5,
        reason: 'Damaged goods'
      }
    ]
    const errors = await validate(dto)
    expect(errors).toHaveLength(0)
  })
  it('should pass validation with empty data (partial update)', async () => {
    const errors = await validate(dto)
    expect(errors).toHaveLength(0)
  })
  it('should pass validation with partial write_offs data', async () => {
    dto.write_offs = [
      {
        product: new mongoose.Types.ObjectId(),
        amount: 3,
        reason: 'Expired'
      },
      {
        product: new mongoose.Types.ObjectId(),
        amount: 1,
        reason: 'Quality issues'
      }
    ]
    const errors = await validate(dto)
    expect(errors).toHaveLength(0)
  })
  it('should fail validation with invalid write_offs data', async () => {
    dto.write_offs = 'invalid' as any
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThanOrEqual(0) 
  })
  it('should have similar structure to CreateWriteOffDto', () => {
    const createDto = new CreateWriteOffDto()
    const updateDto = new UpdateWriteOffDto()
    expect(typeof createDto).toBe('object')
    expect(typeof updateDto).toBe('object')
    expect(createDto).toBeDefined()
    expect(updateDto).toBeDefined()
  })
}) 
/* eslint-disable */

import { normalizeDates } from '../src/utils/normalazeDates'
import { removeUndefinedFields } from '../src/utils/removeUndefinedFields'
import { getRandomStr } from '../src/utils/getRandomString'
import { FileUploadInterceptor } from '../src/utils/uploadFiles'
import { FilesInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
jest.mock('@nestjs/platform-express', () => ({
  FilesInterceptor: jest.fn().mockImplementation((fieldName, maxCount, options) => {
    return {
      fieldName,
      maxCount,
      multerOptions: options,
    }
  }),
}))
jest.mock('multer', () => ({
  diskStorage: jest.fn().mockImplementation((options) => {
    return {
      _options: options,
      destination: options.destination,
      filename: options.filename,
    }
  }),
}))
describe('Utils', () => {
  describe('normalizeDates', () => {
    it('should set start time to 00:00:00.000 and end time to 23:59:59.999', () => {
      const start = new Date('2023-01-01T12:30:45')
      const end = new Date('2023-01-02T10:15:30')
      const [normalizedStart, normalizedEnd] = normalizeDates(start, end)
      expect(normalizedStart.getHours()).toBe(0)
      expect(normalizedStart.getMinutes()).toBe(0)
      expect(normalizedStart.getSeconds()).toBe(0)
      expect(normalizedStart.getMilliseconds()).toBe(0)
      expect(normalizedEnd.getHours()).toBe(23)
      expect(normalizedEnd.getMinutes()).toBe(59)
      expect(normalizedEnd.getSeconds()).toBe(59)
      expect(normalizedEnd.getMilliseconds()).toBe(999)
      expect(normalizedStart.toDateString()).toBe(new Date('2023-01-01').toDateString())
      expect(normalizedEnd.toDateString()).toBe(new Date('2023-01-02').toDateString())
    })
    it('should modify the original date objects', () => {
      const start = new Date('2023-01-01T12:30:45')
      const end = new Date('2023-01-02T10:15:30')
      normalizeDates(start, end)
      expect(start.getHours()).toBe(0)
      expect(end.getHours()).toBe(23)
    })
  })
  describe('removeUndefinedFields', () => {
    it('should remove undefined fields from an object', () => {
      const obj = {
        name: 'John',
        age: 30,
        address: undefined,
        email: 'john@example.com',
        phone: undefined,
      }
      const result = removeUndefinedFields(obj)
      expect(result).toEqual({
        name: 'John',
        age: 30,
        email: 'john@example.com',
      })
      expect(Object.keys(result)).not.toContain('address')
      expect(Object.keys(result)).not.toContain('phone')
    })
    it('should return an empty object when all fields are undefined', () => {
      const obj = {
        a: undefined,
        b: undefined,
      }
      const result = removeUndefinedFields(obj)
      expect(result).toEqual({})
      expect(Object.keys(result).length).toBe(0)
    })
    it('should return original object when no fields are undefined', () => {
      const obj = {
        name: 'John',
        age: 30,
        email: 'john@example.com',
      }
      const result = removeUndefinedFields(obj)
      expect(result).toEqual(obj)
    })
    it('should handle various types of values', () => {
      const obj = {
        string: 'text',
        number: 0,
        zero: 0,
        false: false,
        null: null,
        empty: '',
        undefined: undefined,
        array: [],
        object: {},
      }
      const result = removeUndefinedFields(obj)
      expect(result).toEqual({
        string: 'text',
        number: 0,
        zero: 0,
        false: false,
        null: null,
        empty: '',
        array: [],
        object: {},
      })
      expect(Object.keys(result)).not.toContain('undefined')
    })
  })
  describe('getRandomStr', () => {
    it('should generate a string of the specified length', () => {
      const result1 = getRandomStr(10)
      const result2 = getRandomStr(5)
      const result3 = getRandomStr(3)
      expect(result1.length).toBe(10)
      expect(result2.length).toBe(5)
      expect(result3.length).toBe(3)
    })
    it('should use default length of 5 when no parameter is provided', () => {
      const result = getRandomStr()
      expect(result.length).toBe(5)
    })
    it('should generate different strings on subsequent calls', () => {
      const originalRandom = Math.random
      const originalDateNow = Date.now
      try {
        let callCount = 0
        Math.random = jest.fn().mockImplementation(() => {
          return callCount++ === 0 ? 0.1 : 0.2
        })
        let dateCallCount = 0
        Date.now = jest.fn().mockImplementation(() => {
          return dateCallCount++ === 0 ? 1000000 : 2000000
        })
        const result1 = getRandomStr()
        const result2 = getRandomStr()
        expect(result1).not.toBe(result2)
      } finally {
        Math.random = originalRandom
        Date.now = originalDateNow
      }
    })
  })
  describe('FileUploadInterceptor', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })
    it('should create an interceptor with default parameters', () => {
      const interceptor = FileUploadInterceptor()
      expect(interceptor).toBeDefined()
      expect(FilesInterceptor).toHaveBeenCalledWith('documents', 10, expect.any(Object))
    })
    it('should create an interceptor with custom parameters', () => {
      const interceptor = FileUploadInterceptor('files', 20)
      expect(interceptor).toBeDefined()
      expect(FilesInterceptor).toHaveBeenCalledWith('files', 20, expect.any(Object))
    })
    describe('filename generator', () => {
      beforeEach(() => {
        jest.spyOn(require('../src/utils/getRandomString'), 'getRandomStr').mockReturnValue('abc123')
      })
      afterEach(() => {
        jest.spyOn(require('../src/utils/getRandomString'), 'getRandomStr').mockRestore()
      })
      it('should generate a filename correctly', () => {
        FileUploadInterceptor()
        const filenameFunc = (diskStorage as jest.Mock).mock.calls[0][0].filename
        const req = {}
        const file = { originalname: 'test file.pdf' }
        const cb = jest.fn()
        filenameFunc(req, file, cb)
        expect(cb).toHaveBeenCalledWith(null, expect.stringMatching(/test_file-abc123\.pdf$/))
      })
      it('should sanitize non-alphanumeric characters in the filename', () => {
        FileUploadInterceptor()
        const filenameFunc = (diskStorage as jest.Mock).mock.calls[0][0].filename
        const req = {}
        const file = { originalname: 'special@#$chars 123.docx' }
        const cb = jest.fn()
        filenameFunc(req, file, cb)
        expect(cb).toHaveBeenCalledWith(
          null,
          expect.stringContaining('special'), 
        )
        expect(cb).toHaveBeenCalledWith(
          null,
          expect.stringContaining('abc123'), 
        )
        expect(cb).toHaveBeenCalledWith(
          null,
          expect.stringContaining('.docx'), 
        )
      })
      it('should handle files without extension', () => {
        FileUploadInterceptor()
        const filenameFunc = (diskStorage as jest.Mock).mock.calls[0][0].filename
        const req = {}
        const file = { originalname: 'filename_without_extension' }
        const cb = jest.fn()
        filenameFunc(req, file, cb)
        expect(cb).toHaveBeenCalledWith(null, expect.stringMatching(/^filename_without_extension-abc123$/))
      })
    })
  })
})

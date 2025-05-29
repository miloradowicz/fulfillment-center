require('@testing-library/jest-dom')
const { TextEncoder, TextDecoder } = require('util')

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock import.meta.env for Jest
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      env: {
        VITE_API_HOST: 'http://localhost:8000',
        VITE_FEATURE_PROTECTION_DISABLED: '0',
        NODE_ENV: 'test',
      },
    },
  },
  configurable: true,
})

Object.defineProperty(HTMLFormElement.prototype, 'requestSubmit', {
  value: function () {
    this.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
  },
  configurable: true,
})

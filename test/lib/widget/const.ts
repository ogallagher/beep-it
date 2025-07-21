import { Char, idxToChar, randomChar } from '@lib/widget/const'
import { describe, it } from 'mocha'
import assert from 'node:assert'

describe('lib.widget.const', () => {
  describe('randomChar', () => {
    it('generates expected chars', () => {
      assert.strictEqual(randomChar(0), '0')
      assert.strictEqual(randomChar(1), 'z')
    })
  })
})
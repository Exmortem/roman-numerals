import { validate } from 'class-validator'
import { plainToInstance } from 'class-transformer'
import { RomanNumeralConversion } from './roman-numeral-conversion.dto'

describe('RomanNumeralConversion', () => {
  it('should validate a valid RomanNumeralConversion object', async () => {
    const dto = plainToInstance(RomanNumeralConversion, {
      input: '123',
      output: 'CXXIII',
    })
    const errors = await validate(dto)
    expect(errors.length).toBe(0)
  })

  it('should not allow empty input', async () => {
    const dto = plainToInstance(RomanNumeralConversion, {
      input: '',
      output: 'CXXIII',
    })
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].constraints).toHaveProperty(
      'isNotEmpty',
      'input should not be empty',
    )
  })

  it('should not allow non-string input', async () => {
    const rawDto = { input: 123, output: 'CXXIII' }
    const dto = Object.assign(new RomanNumeralConversion(), rawDto)
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].constraints).toHaveProperty(
      'isString',
      'input must be a string',
    )
  })

  it('should not allow empty output', async () => {
    const dto = plainToInstance(RomanNumeralConversion, {
      input: '123',
      output: '',
    })
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].constraints).toHaveProperty(
      'isNotEmpty',
      'output should not be empty',
    )
  })

  it('should not allow non-string output', async () => {
    const dto = new RomanNumeralConversion()
    dto.input = '123'
    dto.output = 123 as any
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].constraints).toHaveProperty(
      'isString',
      'output must be a string',
    )
  })
})

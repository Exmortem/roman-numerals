import { validate } from 'class-validator'
import { plainToInstance } from 'class-transformer'
import { RomanNumeralRequest } from './roman-numeral-request.dto'

describe('RomanNumeralRequest', () => {
  it('should validate a valid query', async () => {
    const dto = plainToInstance(RomanNumeralRequest, { query: 123 })
    const errors = await validate(dto)
    expect(errors.length).toBe(0)
  })

  it('should not allow query with decimals', async () => {
    const dto = plainToInstance(RomanNumeralRequest, { query: 123.45 })
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].constraints).toHaveProperty(
      'isNumber',
      'The query parameter must be a number and may not contain decimal places.',
    )
  })

  it('should validate a valid min and max', async () => {
    const dto = plainToInstance(RomanNumeralRequest, { min: 1, max: 3999 })
    const errors = await validate(dto)
    expect(errors.length).toBe(0)
  })

  it('should not allow min greater than max', async () => {
    const dto = plainToInstance(RomanNumeralRequest, {
      min: 4000,
      max: 3999,
    })
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].constraints).toHaveProperty(
      'isLessThan',
      'The min parameter must be less than the max parameter.',
    )
  })

  it('should not allow min without max', async () => {
    const dto = plainToInstance(RomanNumeralRequest, { min: 1 })
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].constraints).toHaveProperty(
      'isMinMaxBothPresent',
      'The max parameter must also be provided when the min parameter is set',
    )
  })

  it('should not allow max without min', async () => {
    const dto = plainToInstance(RomanNumeralRequest, { max: 3999 })
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].constraints).toHaveProperty(
      'isMinMaxBothPresent',
      'The min parameter must also be provided when the max parameter is set',
    )
  })

  it('should not allow query with min and max', async () => {
    const dto = plainToInstance(RomanNumeralRequest, {
      query: 123,
      min: 1,
      max: 3999,
    })
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].constraints).toHaveProperty(
      'isQueryExclusive',
      'If query is provided, min and max parameters should not be present.',
    )
  })

  it('should not allow query less than 1', async () => {
    const dto = plainToInstance(RomanNumeralRequest, { query: 0 })
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].constraints).toHaveProperty(
      'min',
      'The query parameter must be greater than or equal to 1.',
    )
  })

  it('should not allow query greater than 3999', async () => {
    const dto = plainToInstance(RomanNumeralRequest, { query: 4000 })
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].constraints).toHaveProperty(
      'max',
      'The query parameter must be less than or equal to 3999.',
    )
  })

  it('should not allow min less than 1', async () => {
    const dto = plainToInstance(RomanNumeralRequest, { min: 0, max: 3999 })
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].constraints).toHaveProperty(
      'min',
      'The min parameter must be greater than or equal to 1.',
    )
  })

  it('should not allow max greater than 3999', async () => {
    const dto = plainToInstance(RomanNumeralRequest, { min: 1, max: 4000 })
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].constraints).toHaveProperty(
      'max',
      'The max parameter must be less than or equal to 3999.',
    )
  })
})

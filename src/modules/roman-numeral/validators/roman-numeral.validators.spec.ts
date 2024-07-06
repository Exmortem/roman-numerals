import { ValidationArguments, validate } from 'class-validator'
import { RomanNumeralRequest } from '../inputs/roman-numeral-request.dto'
import { IsLessThanConstraint } from '../validators/less-than.validator'
import { IsMinMaxBothPresentConstraint } from '../validators/min-max-present.validator'
import { IsQueryExclusiveConstraint } from '../validators/query-exclusive.validator'

describe('RomanNumeralRequest DTO validation', () => {
  it('should validate successfully when only query is provided', async () => {
    const dto = new RomanNumeralRequest()
    dto.query = 123

    const errors = await validate(dto)
    expect(errors.length).toBe(0)
  })

  it('should validate successfully when both min and max are provided and valid', async () => {
    const dto = new RomanNumeralRequest()
    dto.min = 1
    dto.max = 3999

    const errors = await validate(dto)
    expect(errors.length).toBe(0)
  })

  it('should fail validation when query and min/max are provided together', async () => {
    const dto = new RomanNumeralRequest()
    dto.query = 123
    dto.min = 1
    dto.max = 3999

    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].constraints).toHaveProperty('isQueryExclusive')
  })

  it('should fail validation when only min is provided', async () => {
    const dto = new RomanNumeralRequest()
    dto.min = 1

    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].constraints).toHaveProperty('isMinMaxBothPresent')
  })

  it('should fail validation when only max is provided', async () => {
    const dto = new RomanNumeralRequest()
    dto.max = 3999

    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].constraints).toHaveProperty('isMinMaxBothPresent')
  })

  it('should fail validation when min is greater than max', async () => {
    const dto = new RomanNumeralRequest()
    dto.min = 4000
    dto.max = 3999

    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].constraints).toHaveProperty('isLessThan')
  })

  it('should validate successfully when neither query nor min/max are provided', async () => {
    const dto = new RomanNumeralRequest()

    const errors = await validate(dto)
    expect(errors.length).toBe(0)
  })

  it('should fail validation when min and max are equal', async () => {
    const dto = new RomanNumeralRequest()
    dto.min = 3999
    dto.max = 3999

    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].constraints).toHaveProperty('isLessThan')
  })

  it('should fail validation when only min is provided with undefined max', async () => {
    const dto = new RomanNumeralRequest()
    dto.min = 1
    dto.max = undefined

    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].constraints).toHaveProperty('isMinMaxBothPresent')
  })

  it('should fail validation when only max is provided with undefined min', async () => {
    const dto = new RomanNumeralRequest()
    dto.min = undefined
    dto.max = 3999

    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].constraints).toHaveProperty('isMinMaxBothPresent')
  })

  it('should validate when both min and max are undefined', async () => {
    const dto = new RomanNumeralRequest()
    dto.min = undefined
    dto.max = undefined

    const errors = await validate(dto)
    expect(errors.length).toBe(0)
  })

  it('should validate when query is not provided, and min/max are provided', async () => {
    const dto = new RomanNumeralRequest()
    dto.query = undefined
    dto.min = 1
    dto.max = 3999

    const errors = await validate(dto)
    expect(errors.length).toBe(0)
  })

  it('should fail validation when query is not provided, and only min is provided', async () => {
    const dto = new RomanNumeralRequest()
    dto.query = undefined
    dto.min = 1
    dto.max = undefined

    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].constraints).toHaveProperty('isMinMaxBothPresent')
  })

  it('should fail validation when query is not provided, and only max is provided', async () => {
    const dto = new RomanNumeralRequest()
    dto.query = undefined
    dto.min = undefined
    dto.max = 3999

    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].constraints).toHaveProperty('isMinMaxBothPresent')
  })

  it('should return default message for IsLessThanConstraint', () => {
    const constraint = new IsLessThanConstraint()
    const message = constraint.defaultMessage({
      property: 'min',
      constraints: ['max'],
    } as ValidationArguments)
    expect(message).toBe('$property must be less than max')
  })

  it('should return default message for IsMinMaxBothPresentConstraint', () => {
    const constraint = new IsMinMaxBothPresentConstraint()
    const message = constraint.defaultMessage()
    expect(message).toBe(
      'Both min and max parameters must be provided together.',
    )
  })

  it('should return default message for IsQueryExclusiveConstraint', () => {
    const constraint = new IsQueryExclusiveConstraint()
    const message = constraint.defaultMessage()
    expect(message).toBe(
      'If the query parameter is provided, min and max should not be present.',
    )
  })
})

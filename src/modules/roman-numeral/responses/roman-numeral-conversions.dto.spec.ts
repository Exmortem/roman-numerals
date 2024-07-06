import { validate } from 'class-validator'
import { plainToClass } from 'class-transformer'
import { RomanNumeralConversion } from './roman-numeral-conversion.dto'
import { RomanNumeralConversions } from './roman-numeral-conversions.dto'

describe('RomanNumeralConversions DTO', () => {
  it('should validate successfully when at least one valid conversion is provided', async () => {
    const validConversion = new RomanNumeralConversion()
    validConversion.input = '123'
    validConversion.output = 'CXXIII'

    const dto = plainToClass(RomanNumeralConversions, {
      conversions: [validConversion],
    })

    const errors = await validate(dto)
    expect(errors.length).toBe(0)
  })

  it('should fail validation when no conversions are provided', async () => {
    const dto = plainToClass(RomanNumeralConversions, { conversions: [] })

    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].constraints).toHaveProperty('arrayMinSize')
  })

  it('should fail validation when conversions array is not provided', async () => {
    const dto = plainToClass(RomanNumeralConversions, {})

    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].constraints).toHaveProperty('arrayMinSize')
  })

  it('should fail validation when an invalid conversion is provided', async () => {
    const invalidConversion = new RomanNumeralConversion()
    const dto = plainToClass(RomanNumeralConversions, {
      conversions: [invalidConversion],
    })
    const errors = await validate(dto)

    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].children.length).toBeGreaterThan(0)
    expect(errors[0].children[0].children.length).toBeGreaterThan(0)
    expect(errors[0].children[0].children[0].constraints).toHaveProperty(
      'isNotEmpty',
    )
  })
})

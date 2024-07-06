import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { ArrayMinSize, ValidateNested } from 'class-validator'
import { RomanNumeralConversion } from './roman-numeral-conversion.dto'

export class RomanNumeralConversions {
  @ApiProperty({
    description: 'An array of Roman numeral conversions.',
    type: [RomanNumeralConversion],
  })
  @ValidateNested({ each: true, message: 'Each conversion must be valid.' })
  @Type(() => RomanNumeralConversion)
  @ArrayMinSize(1, { message: 'At least one conversion must be provided.' })
  conversions: RomanNumeralConversion[]
}

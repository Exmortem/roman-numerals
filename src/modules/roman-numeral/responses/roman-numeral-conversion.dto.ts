import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty } from 'class-validator'
import { Type } from 'class-transformer'

export class RomanNumeralConversion {
  @ApiProperty({
    description: 'The input number to be converted to a Roman numeral.',
    example: '123',
  })
  @IsString()
  @IsNotEmpty()
  @Type(() => String)
  input: string

  @ApiProperty({
    description: 'The output Roman numeral string.',
    example: 'CXXIII',
  })
  @IsString()
  @IsNotEmpty()
  @Type(() => String)
  output: string
}

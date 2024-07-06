import { IsOptional, IsNumber, Min, Max } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsMinMaxBothPresent } from '../validators/min-max-present.validator'
import { IsQueryExclusive } from '../validators/query-exclusive.validator'
import { IsLessThan } from '../validators/less-than.validator'

export class RomanNumeralRequest {
  @ApiPropertyOptional({
    description:
      'The query parameter. Must be a whole number between 1 and 3999. If provided, min and max parameters should not be present.',
    example: 123,
  })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 0 },
    {
      message:
        'The query parameter must be a number and may not contain decimal places.',
    },
  )
  @Min(1, {
    message: 'The query parameter must be greater than or equal to 1.',
  })
  @Max(3999, {
    message: 'The query parameter must be less than or equal to 3999.',
  })
  @IsQueryExclusive({
    message:
      'If query is provided, min and max parameters should not be present.',
  })
  @Type(() => Number)
  query?: number

  @ApiPropertyOptional({
    description:
      'The minimum value. Must be a whole number between 1 and 3999. If provided, the max parameter must also be provided and must be greater than the min parameter.',
    example: 1,
  })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 0 },
    {
      message:
        'The min parameter must be a number and may not contain decimal places.',
    },
  )
  @IsMinMaxBothPresent({
    message:
      'The max parameter must also be provided when the min parameter is set',
  })
  @Min(1, {
    message: 'The min parameter must be greater than or equal to 1.',
  })
  @Max(3999, {
    message: 'The min parameter must be less than or equal to 3999.',
  })
  @IsLessThan('max', {
    message: 'The min parameter must be less than the max parameter.',
  })
  @Type(() => Number)
  min?: number

  @ApiPropertyOptional({
    description:
      'The maximum value. Must be a whole number between 1 and 3999. If provided, min must also be provided and must be less than max.',
    example: 3999,
  })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 0 },
    {
      message:
        'The max parameter must be a number and may not contain decimal places.',
    },
  )
  @IsMinMaxBothPresent({
    message:
      'The min parameter must also be provided when the max parameter is set',
  })
  @Min(1, {
    message: 'The max parameter must be greater than or equal to 1.',
  })
  @Max(3999, {
    message: 'The max parameter must be less than or equal to 3999.',
  })
  @Type(() => Number)
  max?: number
}

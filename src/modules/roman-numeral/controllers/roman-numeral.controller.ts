import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import {
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger'
import { RomanNumeralRequest } from '../inputs/roman-numeral-request.dto'
import { RomanNumeralService } from '../services/roman-numeral.service'
import { RomanNumeralConversion } from '../responses/roman-numeral-conversion.dto'
import { RomanNumeralConversions } from '../responses/roman-numeral-conversions.dto'

// TODO: clean up packages

// possible switch to pino
// custom metric in telemetry - cached hits vs generated hits

// TODO: add bad request descriptions
@ApiTags('Roman Numeral')
@ApiExtraModels(RomanNumeralConversion, RomanNumeralConversions)
@Controller('romannumeral')
export class RomanNumeralController {
  constructor(private readonly romanNumeralService: RomanNumeralService) {}

  @Get()
  @ApiOperation({
    summary: 'Get Roman Numeral',
    description:
      'Return the Roman Numeral of given integer query or an integer range',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the response',
    content: {
      'application/json': {
        schema: {
          oneOf: [
            { $ref: getSchemaPath(RomanNumeralConversion) },
            { $ref: getSchemaPath(RomanNumeralConversions) },
          ],
        },
      },
    },
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  public async getRomanNumeral(
    @Query() romanNumeralRequest: RomanNumeralRequest,
  ): Promise<RomanNumeralConversion | RomanNumeralConversions> {
    return this.romanNumeralService.getRomanNumeral(romanNumeralRequest)
  }
}

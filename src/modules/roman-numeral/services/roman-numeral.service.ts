import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  LoggerService,
} from '@nestjs/common'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { RomanNumeralRequest } from '../inputs/roman-numeral-request.dto'
import { RomanNumeralConversion } from '../responses/roman-numeral-conversion.dto'
import { RomanNumeralConversions } from '../responses/roman-numeral-conversions.dto'
import { MetricService } from 'nestjs-otel'
import { Counter } from '@opentelemetry/api'

@Injectable()
export class RomanNumeralService {
  private romanNumeralFromCacheCounter: Counter;
  private romanNumeralCalledCounter: Counter;

  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly metricService: MetricService
  ) {
    this.romanNumeralFromCacheCounter = this.metricService.getCounter('roman_numeral_from_cache_counter', {
      description: 'How many times a roman numeral was pulled from the cache',
    });
  
    this.romanNumeralCalledCounter = this.metricService.getCounter('roman_numeral_called_counter', {
      description: 'How many times getRomanNumeral was called',
    });
  }

  public async getRomanNumeral(
    romanNumeralRequest: RomanNumeralRequest,
  ): Promise<RomanNumeralConversion | RomanNumeralConversions> {
    try {
      const { query, min, max } = romanNumeralRequest
      this.romanNumeralCalledCounter.add(1);

      if (query === undefined && min === undefined && max === undefined) {
        throw new BadRequestException('No query or range provided.')
      }

      if (query !== undefined) {
        return await this.getOrSetCache<RomanNumeralConversion>(
          `query:${query}`,
          () => this.convertToRomanNumeral(query),
        )
      }

      if (min !== undefined && max !== undefined) {
        return await this.getOrSetCache<RomanNumeralConversions>(
          `range:${min}:${max}`,
          () => this.convertManyRomanNumerals(min, max),
        )
      }

      throw new InternalServerErrorException(
        'Could not determine the type of conversion to perform.',
      )
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }

  private async getOrSetCache<T>(
    key: string,
    fetchFunction: () => Promise<T>,
  ): Promise<T> {
    this.logger.log(`Fetching: ${key}`)
    const cachedResult = await this.cacheManager.get<T>(key)

    if (cachedResult) {
      this.romanNumeralFromCacheCounter.add(1);
      this.logger.log(`Pulled from cache: ${key}`)
      return cachedResult
    }

    const result = await fetchFunction()
    this.logger.log(`Storing to cache: ${key}`)
    await this.cacheManager.set(key, result)
    return result
  }

  async convertToRomanNumeral(query: number): Promise<RomanNumeralConversion> {
    const result = this.convertNumberToRoman(query)
    return { input: query.toString(), output: result }
  }

  async convertManyRomanNumerals(
    min: number,
    max: number,
    numChunks: number = 4,
  ): Promise<RomanNumeralConversions> {
    const range = max - min + 1
    const chunkSize = Math.ceil(range / numChunks)
    const promises = Array.from({ length: numChunks }, (_, i) => {
      const start = min + i * chunkSize
      const end = Math.min(start + chunkSize - 1, max)
      return this.convertChunk(start, end)
    })

    const results = await Promise.all(promises)
    return { conversions: results.flat() }
  }

  private convertNumberToRoman(query: number): string {
    const values = Object.keys(this.romanNumeralMap)
      .map(Number)
      .sort((a, b) => b - a)

    return values.reduce((acc, value) => {
      while (query >= value) {
        acc += this.romanNumeralMap[value]
        query -= value
      }
      return acc
    }, '')
  }

  private async convertChunk(
    start: number,
    end: number,
  ): Promise<RomanNumeralConversion[]> {
    return Array.from({ length: end - start + 1 }, (_, i) => {
      const input = start + i
      const output = this.convertNumberToRoman(input)
      return { input: input.toString(), output }
    })
  }

  private readonly romanNumeralMap: { [key: number]: string } = {
    1000: 'M',
    900: 'CM',
    500: 'D',
    400: 'CD',
    100: 'C',
    90: 'XC',
    50: 'L',
    40: 'XL',
    10: 'X',
    9: 'IX',
    5: 'V',
    4: 'IV',
    1: 'I',
  }
}

import { Test, TestingModule } from '@nestjs/testing'
import { RomanNumeralService } from './roman-numeral.service'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { RomanNumeralRequest } from '../inputs/roman-numeral-request.dto'
import { RomanNumeralConversion } from '../responses/roman-numeral-conversion.dto'
import { RomanNumeralConversions } from '../responses/roman-numeral-conversions.dto'
import { CacheModule, Cache, CACHE_MANAGER } from '@nestjs/cache-manager'
import { Logger } from '@nestjs/common'

describe('RomanNumeralService', () => {
  let service: RomanNumeralService
  let logger: Logger
  let cacheManager: Cache

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CacheModule.register({
          ttl: 10000,
          max: 100,
        }),
      ],
      providers: [
        RomanNumeralService,
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<RomanNumeralService>(RomanNumeralService)
    logger = module.get<Logger>(WINSTON_MODULE_NEST_PROVIDER)
    cacheManager = module.get<Cache>(CACHE_MANAGER)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should convert a single number to a Roman numeral and cache the result', async () => {
    const request: RomanNumeralRequest = { query: 1990 }
    const result = await service.getRomanNumeral(request)

    expect(result).toMatchObject<RomanNumeralConversion>({
      input: expect.any(String),
      output: expect.any(String),
    })

    expect(result).toEqual({ input: '1990', output: 'MCMXC' })

    const cachedResult =
      await cacheManager.get<RomanNumeralConversion>('query:1990')
    expect(cachedResult).toEqual(result)
  })

  it('should log fetching and storing messages for a single number conversion', async () => {
    const logSpy = jest.spyOn(logger, 'log')
    const request: RomanNumeralRequest = { query: 1990 }
    await service.getRomanNumeral(request)

    expect(logSpy).toHaveBeenCalledWith('Fetching: query:1990')
    expect(logSpy).toHaveBeenCalledWith('Storing to cache: query:1990')
  })

  it('should retrieve a single number Roman numeral conversion from cache and log it', async () => {
    const logSpy = jest.spyOn(logger, 'log')
    const request: RomanNumeralRequest = { query: 1990 }
    const cachedConversion: RomanNumeralConversion = {
      input: '1990',
      output: 'MCMXC',
    }

    await cacheManager.set('query:1990', cachedConversion)
    const result = await service.getRomanNumeral(request)

    expect(result).toEqual(cachedConversion)
    expect(logSpy).toHaveBeenCalledWith('Fetching: query:1990')
    expect(logSpy).toHaveBeenCalledWith('Pulled from cache: query:1990')
  })

  it('should convert a range of numbers to Roman numerals and cache the result', async () => {
    const request: RomanNumeralRequest = { min: 1, max: 3 }
    const result = await service.getRomanNumeral(request)

    expect(result).toMatchObject<RomanNumeralConversions>({
      conversions: expect.arrayContaining([
        expect.objectContaining<RomanNumeralConversion>({
          input: expect.any(String),
          output: expect.any(String),
        }),
      ]),
    })

    expect(result).toEqual({
      conversions: [
        { input: '1', output: 'I' },
        { input: '2', output: 'II' },
        { input: '3', output: 'III' },
      ],
    })

    const cachedResult =
      await cacheManager.get<RomanNumeralConversions>('range:1:3')
    expect(cachedResult).toEqual(result)
  })

  it('should log fetching and storing messages for a range conversion', async () => {
    const logSpy = jest.spyOn(logger, 'log')
    const request: RomanNumeralRequest = { min: 1, max: 3 }
    await service.getRomanNumeral(request)

    expect(logSpy).toHaveBeenCalledWith('Fetching: range:1:3')
    expect(logSpy).toHaveBeenCalledWith('Storing to cache: range:1:3')
  })

  it('should retrieve a range of Roman numeral conversions from cache and log it', async () => {
    const logSpy = jest.spyOn(logger, 'log')
    const request: RomanNumeralRequest = { min: 1, max: 3 }
    const cachedConversions: RomanNumeralConversions = {
      conversions: [
        { input: '1', output: 'I' },
        { input: '2', output: 'II' },
        { input: '3', output: 'III' },
      ],
    }

    await cacheManager.set('range:1:3', cachedConversions)
    const result = await service.getRomanNumeral(request)

    expect(result).toEqual(cachedConversions)
    expect(logSpy).toHaveBeenCalledWith('Fetching: range:1:3')
    expect(logSpy).toHaveBeenCalledWith('Pulled from cache: range:1:3')
  })

  it('should throw an error if the conversion type cannot be determined and log it', async () => {
    const errorSpy = jest.spyOn(logger, 'error')
    const request: RomanNumeralRequest = {}
    await expect(service.getRomanNumeral(request)).rejects.toThrow(
      'No query or range provided.',
    )
    expect(errorSpy).toHaveBeenCalledWith('No query or range provided.')
  })
})

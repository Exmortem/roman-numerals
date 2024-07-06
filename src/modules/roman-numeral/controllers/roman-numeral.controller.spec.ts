import { Test, TestingModule } from '@nestjs/testing'
import { RomanNumeralController } from './roman-numeral.controller'
import { RomanNumeralService } from '../services/roman-numeral.service'
import { RomanNumeralRequest } from '../inputs/roman-numeral-request.dto'
import { RomanNumeralConversion } from '../responses/roman-numeral-conversion.dto'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { RomanNumeralConversions } from '../responses/roman-numeral-conversions.dto'
import { CacheModule } from '@nestjs/cache-manager'
import { InternalServerErrorException } from '@nestjs/common'

describe('RomanNumeralController', () => {
  let controller: RomanNumeralController
  let service: RomanNumeralService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CacheModule.register({
          ttl: 10000,
          max: 100,
        }),
      ],
      controllers: [RomanNumeralController],
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

    controller = module.get<RomanNumeralController>(RomanNumeralController)
    service = module.get<RomanNumeralService>(RomanNumeralService)
  })

  describe('getRomanNumeral', () => {
    it('should convert a single number to a Roman numeral', async () => {
      const request: RomanNumeralRequest = { query: 1990 }
      const expectedResult: RomanNumeralConversion = {
        input: '1990',
        output: 'MCMXC',
      }

      jest.spyOn(service, 'getRomanNumeral').mockResolvedValue(expectedResult)
      const result = await controller.getRomanNumeral(request)

      expect(result).toMatchObject<RomanNumeralConversion>({
        input: expect.any(String),
        output: expect.any(String),
      })

      expect(result).toEqual(expectedResult)
    })

    it('should convert a range of numbers to Roman numerals', async () => {
      const request: RomanNumeralRequest = { min: 1, max: 3 }
      const expectedResult = {
        conversions: [
          { input: '1', output: 'I' },
          { input: '2', output: 'II' },
          { input: '3', output: 'III' },
        ],
      }

      jest.spyOn(service, 'getRomanNumeral').mockResolvedValue(expectedResult)
      const result = await controller.getRomanNumeral(request)

      expect(result).toMatchObject<RomanNumeralConversions>({
        conversions: expect.arrayContaining([
          expect.objectContaining<RomanNumeralConversion>({
            input: expect.any(String),
            output: expect.any(String),
          }),
        ]),
      })

      expect(result).toEqual(expectedResult)
    })

    it('it should throw an error if the conversion type cannot be determined', async () => {
      const request: RomanNumeralRequest = {}

      jest
        .spyOn(service, 'getRomanNumeral')
        .mockRejectedValue(
          new InternalServerErrorException(
            'Could not determine the type of conversion to perform.',
          ),
        )
      await expect(controller.getRomanNumeral(request)).rejects.toThrow(
        'Could not determine the type of conversion to perform.',
      )
    })

    it('should throw an error if the service throws an error', async () => {
      const request: RomanNumeralRequest = {}

      jest
        .spyOn(service, 'getRomanNumeral')
        .mockRejectedValue(new Error('An error occurred.'))
      await expect(controller.getRomanNumeral(request)).rejects.toThrow(
        'An error occurred',
      )
    })
  })
})

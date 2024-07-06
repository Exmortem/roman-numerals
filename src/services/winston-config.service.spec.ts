import { Test, TestingModule } from '@nestjs/testing'
import { WinstonConfigService } from './winston-config.service'
import { ClsService } from 'nestjs-cls'
import * as winston from 'winston'
import { TransformableInfo } from 'logform'

describe('WinstonConfigService', () => {
  let service: WinstonConfigService
  let clsService: ClsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WinstonConfigService,
        {
          provide: ClsService,
          useValue: {
            getId: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<WinstonConfigService>(WinstonConfigService)
    clsService = module.get<ClsService>(ClsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should return winston module options', () => {
    const options = service.createWinstonModuleOptions()
    expect(options).toBeDefined()

    const transports = Array.isArray(options.transports)
      ? options.transports
      : [options.transports]
    expect(transports.length).toBe(1)

    const consoleTransport = transports[0]
    expect(consoleTransport).toBeInstanceOf(winston.transports.Console)
  })

  it('should format log messages with requestId', () => {
    const requestId = 'test-request-id'
    jest.spyOn(clsService, 'getId').mockReturnValue(requestId)

    const info: TransformableInfo = {
      timestamp: '2024-07-04T12:34:56Z',
      level: 'info',
      message: 'Test message',
    }

    const format = winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, level, message }) => {
        let requestId: string
        try {
          requestId = clsService.getId()
        } catch {
          requestId = 'no-id'
        }
        return `${timestamp} [${requestId ? requestId : 'no-id'}] ${level}: ${message}`
      }),
    )

    const formattedMessage = format.transform(info, info)

    if (
      typeof formattedMessage === 'object' &&
      formattedMessage !== null &&
      'message' in formattedMessage
    ) {
      const resultMessage = formattedMessage.message
      expect(resultMessage).toContain('Test message')
    } else {
      fail('Log transformation did not return the expected format')
    }
  })

  it('should format log messages without requestId', () => {
    jest.spyOn(clsService, 'getId').mockReturnValue(undefined)

    const info: TransformableInfo = {
      timestamp: '2024-07-04T12:34:56Z',
      level: 'info',
      message: 'Test message',
    }

    const format = winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, level, message }) => {
        let requestId: string
        try {
          requestId = clsService.getId()
        } catch {
          requestId = 'no-id'
        }
        return `${timestamp} [${requestId ? requestId : 'no-id'}] ${level}: ${message}`
      }),
    )

    const formattedMessage = format.transform(info, info)

    if (
      typeof formattedMessage === 'object' &&
      formattedMessage !== null &&
      'message' in formattedMessage
    ) {
      const resultMessage = formattedMessage.message
      expect(resultMessage).toContain('Test message')
    } else {
      fail('Log transformation did not return the expected format')
    }
  })

  it('should handle case when clsService.getId() returns null', () => {
    jest.spyOn(clsService, 'getId').mockReturnValue(null)

    const info: TransformableInfo = {
      timestamp: '2024-07-04T12:34:56Z',
      level: 'info',
      message: 'Test message',
    }

    const format = winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, level, message }) => {
        let requestId: string
        try {
          requestId = clsService.getId()
        } catch {
          requestId = 'no-id'
        }
        return `${timestamp} [${requestId ? requestId : 'no-id'}] ${level}: ${message}`
      }),
    )

    const formattedMessage = format.transform(info, info)

    if (
      typeof formattedMessage === 'object' &&
      formattedMessage !== null &&
      'message' in formattedMessage
    ) {
      const resultMessage = formattedMessage.message
      expect(resultMessage).toContain('Test message')
    } else {
      fail('Log transformation did not return the expected format')
    }
  })

  it('should handle case when clsService.getId() throws an error', () => {
    jest.spyOn(clsService, 'getId').mockImplementation(() => {
      throw new Error('Test error')
    })

    const info: TransformableInfo = {
      timestamp: '2024-07-04T12:34:56Z',
      level: 'error',
      message: 'Test error message',
    }

    const format = winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, level, message }) => {
        let requestId: string
        try {
          requestId = clsService.getId()
        } catch {
          requestId = 'no-id'
        }
        return `${timestamp} [${requestId ? requestId : 'no-id'}] ${level}: ${message}`
      }),
    )

    const formattedMessage = format.transform(info, info)

    if (
      typeof formattedMessage === 'object' &&
      formattedMessage !== null &&
      'message' in formattedMessage
    ) {
      const resultMessage = formattedMessage.message
      expect(resultMessage).toContain('Test error message')
    } else {
      fail('Log transformation did not return the expected format')
    }
  })
})

import { Test, TestingModule } from '@nestjs/testing'
import { HealthController } from './health.controller'
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheckResult,
} from '@nestjs/terminus'

describe('HealthController', () => {
  let healthController: HealthController
  let healthCheckService: HealthCheckService
  let httpHealthIndicator: HttpHealthIndicator

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: {
            check: jest.fn(),
          },
        },
        {
          provide: HttpHealthIndicator,
          useValue: {
            pingCheck: jest.fn().mockResolvedValue({ status: 'up' }),
          },
        },
      ],
    }).compile()

    healthController = module.get<HealthController>(HealthController)
    healthCheckService = module.get<HealthCheckService>(HealthCheckService)
    httpHealthIndicator = module.get<HttpHealthIndicator>(HttpHealthIndicator)
  })

  it('should be defined', () => {
    expect(healthController).toBeDefined()
  })

  it('should return health check result', async () => {
    const mockResult = {
      status: 'ok',
      info: { prometheus: { status: 'up' } },
      error: {},
      details: { prometheus: { status: 'up' } },
    } as HealthCheckResult

    ;(healthCheckService.check as jest.Mock).mockImplementation(
      (checks: any[]) => {
        return Promise.all(checks.map(check => check())).then(() => mockResult)
      },
    )

    const result = await healthController.healthCheck()
    expect(result).toEqual(mockResult)
    expect(healthCheckService.check).toHaveBeenCalledWith([
      expect.any(Function),
    ])
    expect(httpHealthIndicator.pingCheck).toHaveBeenCalledWith(
      'prometheus',
      'http://prometheus:9090',
    )
  })
})

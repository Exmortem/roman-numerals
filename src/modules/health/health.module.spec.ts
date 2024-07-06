import { Test, TestingModule } from '@nestjs/testing'
import { TerminusModule } from '@nestjs/terminus'
import { HttpModule } from '@nestjs/axios'
import { HealthController } from './controllers/health.controller'

describe('HealthModule', () => {
  let healthController: HealthController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TerminusModule, HttpModule],
      controllers: [HealthController],
    }).compile()

    healthController = module.get<HealthController>(HealthController)
  })

  it('should be defined', () => {
    expect(healthController).toBeDefined()
  })
})

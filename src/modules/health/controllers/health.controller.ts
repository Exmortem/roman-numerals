import { Controller, Get } from '@nestjs/common'
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
  HealthCheckResult,
} from '@nestjs/terminus'

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  public async healthCheck(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.http.pingCheck('prometheus', 'http://prometheus:9090'),
    ])
  }
}

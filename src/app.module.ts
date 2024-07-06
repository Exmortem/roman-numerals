import { Module } from '@nestjs/common'
import { RomanNumeralModule } from './modules/roman-numeral/roman-numeral.module'
import { ClsModule } from 'nestjs-cls'
import { v4 as uuidv4 } from 'uuid'
import { Request } from 'express'
import { WinstonModule } from 'nest-winston'
import { WinstonConfigService } from './services/winston-config.service'
import { HealthModule } from './modules/health/health.module'
import { OpenTelemetryModule } from 'nestjs-otel'

@Module({
  imports: [
    OpenTelemetryModule.forRoot({
      metrics: {
        hostMetrics: true,
        apiMetrics: {
          enable: true,
          prefix: 'roman_numeral',
        },
      },
    }),
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        generateId: true,
        idGenerator: (req: Request) => {
          const id = req.headers['x-request-id'] || uuidv4()
          req.headers['x-request-id'] = id
          return id
        },
      },
    }),
    WinstonModule.forRootAsync({
      useClass: WinstonConfigService,
    }),
    RomanNumeralModule,
    HealthModule,
  ],
  controllers: [],
  providers: [WinstonConfigService],
})
export class AppModule {}

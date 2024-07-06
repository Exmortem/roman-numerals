import { Injectable } from '@nestjs/common'
import { WinstonModuleOptions, WinstonModuleOptionsFactory } from 'nest-winston'
import * as winston from 'winston'
import { ClsService } from 'nestjs-cls'

@Injectable()
export class WinstonConfigService implements WinstonModuleOptionsFactory {
  constructor(private readonly clsService: ClsService) {}

  createWinstonModuleOptions(): WinstonModuleOptions {
    return {
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.printf(({ timestamp, level, message }) => {
              const requestId = this.clsService.getId()
              return `${timestamp} [${requestId ? requestId : 'no-id'}] ${level}: ${message}`
            }),
          ),
        }),
      ],
    }
  }
}

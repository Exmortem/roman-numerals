import { Module } from '@nestjs/common'
import { RomanNumeralController } from './controllers/roman-numeral.controller'
import { RomanNumeralService } from './services/roman-numeral.service'
import { CacheModule } from '@nestjs/cache-manager'

@Module({
  imports: [
    CacheModule.register({
      ttl: 10000,
      max: 100,
    }),
  ],
  controllers: [RomanNumeralController],
  providers: [RomanNumeralService],
})
export class RomanNumeralModule {}

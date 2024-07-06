import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import helmet from 'helmet'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import otelSDK from './services/telemetry.service'

async function bootstrap() {
  await otelSDK.start()
  const app = await NestFactory.create(AppModule)

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER))

  app.use(
    helmet({
      hsts: true,
      hidePoweredBy: true,
      xXssProtection: true,
    }),
  )

  const config = new DocumentBuilder()
    .setTitle('Integer to Roman Numeral API')
    .setDescription('API to convert integers to roman numerals')
    .setVersion('1.0')
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('docs', app, document)

  await app.listen(3000)
}

bootstrap()

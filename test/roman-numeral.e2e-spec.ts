// test/roman-numeral-new.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { RomanNumeralModule } from '../src/modules/roman-numeral/roman-numeral.module'
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager'
import { WINSTON_MODULE_NEST_PROVIDER, WinstonModule } from 'nest-winston'
import { WinstonConfigService } from '../src/services/winston-config.service'
import { ClsModule } from 'nestjs-cls'
import { v4 as uuidv4 } from 'uuid'
import { OpenTelemetryModule } from 'nestjs-otel'

describe('RomanNumeralController - New Tests (e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        CacheModule.register({
          ttl: 10000,
          max: 100,
        }),
        RomanNumeralModule,
        WinstonModule.forRootAsync({
          useClass: WinstonConfigService,
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
        OpenTelemetryModule.forRoot({
          metrics: {
            hostMetrics: true,
            apiMetrics: {
              enable: true,
              prefix: 'roman_numeral',
            },
          },
        }),
      ],
      providers: [
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('/romannumeral (GET) - single query test case', async () => {
    const query = 1990
    const response = await request(app.getHttpServer())
      .get('/romannumeral')
      .query({ query })
      .expect(200)

    expect(response.body).toEqual({
      input: query.toString(),
      output: 'MCMXC',
    })
  })

  it('/romannumeral (GET) - range query test case', async () => {
    const min = 10
    const max = 12
    const response = await request(app.getHttpServer())
      .get('/romannumeral')
      .query({ min, max })
      .expect(200)

    expect(response.body).toEqual({
      conversions: [
        { input: '10', output: 'X' },
        { input: '11', output: 'XI' },
        { input: '12', output: 'XII' },
      ],
    })
  })

  it('/romannumeral (GET) - invalid query test case', async () => {
    const query = 'invalid'
    await request(app.getHttpServer())
      .get('/romannumeral')
      .query({ query })
      .expect(400)
  })

  it('/romannumeral (GET) - query parameter missing', async () => {
    await request(app.getHttpServer()).get('/romannumeral').expect(400)
  })

  it('/romannumeral (GET) - range query minimum value larger than maximum value', async () => {
    const min = 5
    const max = 3
    await request(app.getHttpServer())
      .get('/romannumeral')
      .query({ min, max })
      .expect(400)
  })

  it('/romannumeral (GET) - query parameter below valid range', async () => {
    const query = 0
    await request(app.getHttpServer())
      .get('/romannumeral')
      .query({ query })
      .expect(400)
  })

  it('/romannumeral (GET) - query parameter above valid range', async () => {
    const query = 4000
    await request(app.getHttpServer())
      .get('/romannumeral')
      .query({ query })
      .expect(400)
  })

  it('/romannumeral (GET) - range query with min equal to max', async () => {
    const min = 10
    const max = 10
    await request(app.getHttpServer())
      .get('/romannumeral')
      .query({ min, max })
      .expect(400)
  })

  it('/romannumeral (GET) - range query with large range', async () => {
    const min = 1
    const max = 100
    const response = await request(app.getHttpServer())
      .get('/romannumeral')
      .query({ min, max })
      .expect(200)

    expect(response.body.conversions.length).toBe(100)
  })

  it('/romannumeral (GET) - simultaneous query and range parameters', async () => {
    const query = 10
    const min = 1
    const max = 5
    await request(app.getHttpServer())
      .get('/romannumeral')
      .query({ query, min, max })
      .expect(400)
  })

  it('/romannumeral (GET) - caching behavior', async () => {
    const query = 1990
    const cacheKey = `query:${query}`
    const expectedCacheValue = {
      input: query.toString(),
      output: 'MCMXC',
    }

    const cacheManager = app.get(CACHE_MANAGER)
    const spyGet = jest.spyOn(cacheManager, 'get')
    const spySet = jest.spyOn(cacheManager, 'set')

    await cacheManager.del(cacheKey)

    const response1 = await request(app.getHttpServer())
      .get('/romannumeral')
      .query({ query })
      .expect(200)

    expect(response1.body).toEqual(expectedCacheValue)
    expect(spyGet).toHaveBeenCalledWith(cacheKey)
    expect(spySet).toHaveBeenCalledWith(cacheKey, expectedCacheValue)

    spyGet.mockClear()
    spySet.mockClear()

    const response2 = await request(app.getHttpServer())
      .get('/romannumeral')
      .query({ query })
      .expect(200)

    expect(response2.body).toEqual(expectedCacheValue)
    expect(spyGet).toHaveBeenCalledWith(cacheKey)
    expect(spySet).not.toHaveBeenCalled()
  })
})

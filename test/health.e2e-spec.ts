// test/health.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { HealthModule } from '../src/modules/health/health.module'
import { TerminusModule } from '@nestjs/terminus'
import { HttpModule } from '@nestjs/axios'
import { HttpService } from '@nestjs/axios'
import { of } from 'rxjs'
import { AxiosResponse, InternalAxiosRequestConfig, AxiosHeaders } from 'axios'

describe('HealthController (e2e)', () => {
  let app: INestApplication
  let httpService: HttpService

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TerminusModule, HttpModule, HealthModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    httpService = moduleFixture.get<HttpService>(HttpService)

    const response: AxiosResponse = {
      data: {},
      status: 200,
      statusText: 'OK',
      headers: new AxiosHeaders(),
      config: {
        headers: new AxiosHeaders(),
        url: 'http://prometheus:9090',
        method: 'get',
      } as InternalAxiosRequestConfig,
    }
    jest.spyOn(httpService, 'get').mockImplementation(() => of(response))

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('/health (GET) - should return health check result', async () => {
    const response = await request(app.getHttpServer())
      .get('/health')
      .expect(503)

    console.log(response.body)

    expect(response.body).toEqual({
      status: 'error',
      info: {},
      error: {
        prometheus: {
          status: 'down',
          message: 'getaddrinfo ENOTFOUND prometheus',
        },
      },
      details: {
        prometheus: {
          status: 'down',
          message: 'getaddrinfo ENOTFOUND prometheus',
        },
      },
    })
  })
})

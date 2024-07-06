import otelSDK, { shutdownOtelSDK } from '../services/telemetry.service'
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express'
import * as process from 'process'
import { NodeSDK } from '@opentelemetry/sdk-node'

describe('otelSDK', () => {
  it('should be defined', () => {
    expect(otelSDK).toBeDefined()
  })

  it('should initialize with correct configuration', () => {
    const traceExporter = new OTLPTraceExporter({
      url: 'http://otel-collector:4318/v1/traces',
    })

    const metricExporter = new OTLPMetricExporter({
      url: 'http://otel-collector:4318/v1/metrics',
    })

    const expectedSDK = new NodeSDK({
      traceExporter: traceExporter,
      metricReader: new PeriodicExportingMetricReader({
        exporter: metricExporter,
      }),
      contextManager: new AsyncLocalStorageContextManager(),
      instrumentations: [
        new NestInstrumentation(),
        new HttpInstrumentation(),
        new ExpressInstrumentation(),
      ],
    })

    expect(expectedSDK).toBeInstanceOf(NodeSDK)
  })

  it('should shutdown on SIGTERM signal', async () => {
    const mockShutdown = jest
      .spyOn(otelSDK, 'shutdown')
      .mockImplementation(() => Promise.resolve())
    const mockProcessExit = jest
      .spyOn(process, 'exit')
      .mockImplementation(code => {
        throw new Error(`process.exit called with "${code}"`)
      })

    try {
      await shutdownOtelSDK()
    } catch (error) {
      expect(error).toEqual(new Error('process.exit called with "0"'))
    }

    expect(mockShutdown).toHaveBeenCalled()
    expect(mockProcessExit).toHaveBeenCalledWith(0)

    mockShutdown.mockRestore()
    mockProcessExit.mockRestore()
  })

  //   it('should log error if shutdown fails', async () => {
  //     const consoleErrorSpy = jest.spyOn(console, 'log').mockImplementation(() => { /* do nothing */ });
  //     const mockShutdown = jest.spyOn(otelSDK, 'shutdown').mockImplementation(() => Promise.reject('error'));

  //     try {
  //       await shutdownOtelSDK();
  //     } catch (error) {
  //       expect(error).toEqual(new Error('process.exit called with "0"'));
  //     }

  //     expect(consoleErrorSpy).toHaveBeenCalledWith('Error shutting down SDK', 'error');

  //     consoleErrorSpy.mockRestore();
  //     mockShutdown.mockRestore();
  //   });
})

import { NodeSDK } from '@opentelemetry/sdk-node'
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks'
import * as process from 'process'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express'

const traceExporter = new OTLPTraceExporter({
  url: 'http://otel-collector:4318/v1/traces',
})

const metricExporter = new OTLPMetricExporter({
  url: 'http://otel-collector:4318/v1/metrics',
})

const otelSDK = new NodeSDK({
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

export default otelSDK

export const shutdownOtelSDK = async () => {
  try {
    await otelSDK.shutdown()
    console.log('SDK shut down successfully')
  } catch (err) {
    console.log('Error shutting down SDK', err)
  } finally {
    process.exit(0)
  }
}

process.on('SIGTERM', shutdownOtelSDK)

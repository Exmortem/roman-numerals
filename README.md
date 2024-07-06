## Description

API to convert integers into Roman Numerals. Contains test suites, logging via Winston, and telemetry (tracing, metrics) via Open Telemetry.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# start
$ npm run start:debug
```

## Running the app using docker-compose

```bash
$ docker compose up --build
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Linting
```bash
 #run linting
 $ npm run lint
```

## Telemetry

Telemetry can be accessed through the following URLs when running from docker-compose:
- Open Telemetry Metrics: http://localhost:8888/metrics
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001

## License

[GNU licensed](LICENSE).
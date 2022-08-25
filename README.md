# Kafka Client

- [Kafka Client](#kafka-client)
  - [Main app](#main-app)
  - [Run local kafka instance](#run-local-kafka-instance)
  - [Utilities](#utilities)

This kafka client runs on nodejs with [kafkajs](https://www.npmjs.com/package/kafkajs).

## Main app

The kafka producer and consumer clients are on [./app/kafka](./app/kafka/). THere is an [example test](./test/kafka.test.ts) that uses these two clients.

## Run local kafka instance

The sample tests uses a local instance of kafka. You can start these by tunning the start script in [./script/start.sh](./script/start.sh). kakfa is then accessible from `loclahost:29092`. This is the default broker url set from the [config](./app/config.ts).

## Utilities

If there are any functions that are shared across the app, add them to the [utilities](./app/utilities/) directory. When you add a utility, add and export if from the [index file](./app/utilities/index.ts) so it can be imported from `utilities`.

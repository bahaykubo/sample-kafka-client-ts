#!/bin/bash

set -x
export COMPOSE_HTTP_TIMEOUT=180

docker compose -p kafka down
docker container rm --force $(docker ps --filter "network=kafka_default" -a -q)
docker network rm kafka_default

#!/bin/bash

# Example of DOCKER_IMAGE_NAME and DOCKER_IMAGE_VERSION:
DOCKER_IMAGE_NAME=omvcl/web_app
DOCKER_IMAGE_VERSION=1.0.0-dev

#set -a; source .env; set +a;

docker rmi --force=true ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_VERSION}
docker build --no-cache --force-rm=true --rm=true \
  --build-arg SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN} \
  --build-arg SENTRY_ORG=${SENTRY_ORG} \
  --build-arg SENTRY_PROJECT=${SENTRY_PROJECT} \
  -t ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_VERSION} .
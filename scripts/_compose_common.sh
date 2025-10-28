#!/usr/bin/env bash
set -euo pipefail

# Move to repo root (one level up from this scripts/ dir)
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

# Pick docker compose binary (supports both Docker v2 and legacy)
if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  DOCKER_COMPOSE=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  DOCKER_COMPOSE=(docker-compose)
else
  echo "Error: docker compose not found." >&2
  exit 1
fi

# Compose files & env files
BASE_FILES=(-f compose.base.yml)
DEV_FILES=("${BASE_FILES[@]}" -f compose.dev.yml)
PROD_FILES=("${BASE_FILES[@]}" -f compose.prod.yml)

ENV_SHARED=(--env-file env/.env.shared)
ENV_DEV=("${ENV_SHARED[@]}" --env-file env/.env.dev)
ENV_PROD=("${ENV_SHARED[@]}" --env-file env/.env.prod)

# Small helper to run compose
compose() {
  # shellcheck disable=SC2068
  "${DOCKER_COMPOSE[@]}" $@
}

compose_dev() {
  compose "${DEV_FILES[@]}" "${ENV_DEV[@]}" "$@"
}

compose_prod() {
  compose "${PROD_FILES[@]}" "${ENV_PROD[@]}" "$@"
}

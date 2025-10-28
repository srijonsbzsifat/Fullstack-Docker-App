#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/_compose_common.sh"

# Build & run with dev overlay (bind mounts, NODE_ENV=development)
compose_dev up --build

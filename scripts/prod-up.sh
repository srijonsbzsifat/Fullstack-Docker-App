#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/_compose_common.sh"

# Build & run in detached mode with prod overlay (immutable, NODE_ENV=production)
compose_prod up -d --build

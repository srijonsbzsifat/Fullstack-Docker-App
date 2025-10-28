#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/_compose_common.sh"

# Rebuild images without starting containers
compose_dev build --no-cache

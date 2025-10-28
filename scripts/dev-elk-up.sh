#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/_compose_common.sh"

echo "Starting development environment with ELK stack..."
compose_dev_elk up --build
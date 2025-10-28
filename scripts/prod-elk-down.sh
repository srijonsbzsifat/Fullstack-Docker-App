#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/_compose_common.sh"

echo "Stopping production environment with ELK stack..."
compose_prod_elk down
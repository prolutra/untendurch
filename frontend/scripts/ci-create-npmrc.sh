#!/usr/bin/env bash
set -e

current_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]:-$0}")" &>/dev/null && pwd 2>/dev/null)"
cd "$current_dir/.."

echo 'registry=https://nexus.tegonal.com/repository/npm-proxy/' > ~/.npmrc
encoded=$(echo -n "$NEXUS_USERNAME:$NEXUS_PASSWORD" | base64)
echo "_auth=$encoded"  >> ~/.npmrc

#!/usr/bin/env bash

# Set bash unofficial strict mode http://redsymbol.net/articles/unofficial-bash-strict-mode/
set -euo pipefail
IFS=$'\n\t'

# Set DEBUG to true for enhanced debugging: run prefixed with "DEBUG=true"
${DEBUG:-false} && set -vx
# Credit to https://stackoverflow.com/a/17805088
# and http://wiki.bash-hackers.org/scripting/debuggingtips
export PS4='+(${BASH_SOURCE}:${LINENO}): ${FUNCNAME[0]:+${FUNCNAME[0]}(): }'

ALLOW_PREFIXED=${INPUT_ALLOW_PREFIXED:-}
ALLOW_UPDATE=${INPUT_ALLOW_UPDATE:-}
EXCLUDE=${INPUT_EXCLUDE:-}
SHALLOW=${INPUT_SHALLOW:-}

FLAGS=""

if [[ -n "$ALLOW_PREFIXED"  ]]; then
  FLAGS="$FLAGS--allow-prefixed "
fi

if [[ -n "$ALLOW_UPDATE"  ]]; then
  FLAGS="$FLAGS--allow-update $ALLOW_UPDATE "
fi

if [[ -n "$EXCLUDE"  ]]; then
  FLAGS="$FLAGS--exclude $EXCLUDE "
fi

if [[ -n "$SHALLOW"  ]]; then
  FLAGS="$FLAGS--shallow"
fi

echo "versionator $FLAGS"

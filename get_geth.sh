#!/bin/bash
# WARNING: the following script has a high concentration of YOLOs

set -e

# Note: $HOMEDIR is defined in main.js, check it out
HOMEDIR=${HOMEDIR:-"."}

# Unfortunately GitHub ratelimits the following requests when running on travis. That's the reason why I had to hardcode the values of VERSION and COMMIT for now.
# VERSION=$(curl -s https://api.github.com/repos/ethereum/go-ethereum/releases/latest | python -c "import sys, json; print(json.load(sys.stdin)['tag_name'])")
# COMMIT=$(curl -s https://api.github.com/repos/ethereum/go-ethereum/commits/${VERSION} | python -c "import sys, json; print(json.load(sys.stdin)['sha'])")
VERSION="1.10.8"
COMMIT="26675454"
PLATFORM=$(uname | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)
NAME="geth-${PLATFORM}-amd64-${VERSION}-${COMMIT}"
DOWNLOAD_URL="https://gethstore.blob.core.windows.net/builds/${NAME}.tar.gz"
TMP_FILE=$(mktemp)

echo "Downloading ${DOWNLOAD_URL}"
curl --fail ${DOWNLOAD_URL} | tar -Oxzf - ${NAME}/geth > ${TMP_FILE}
mv ${TMP_FILE} ${HOMEDIR}/geth
chmod +x ${HOMEDIR}/geth

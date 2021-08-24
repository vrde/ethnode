#!/bin/bash

set -e

# Note: $HOMEDIR is defined in main.js, check it out
HOMEDIR=${HOMEDIR:-"."}

PLATFORM=$(uname | tr '[:upper:]' '[:lower:]')
DIST=$([ "${PLATFORM}" == "darwin" ] && echo "macos" || echo "linux")
DOWNLOAD_URL="https://github.com/openethereum/openethereum/releases/download/v3.3.0-rc.7/openethereum-${DIST}-v3.3.0-rc.7.zip"
TMP_DIR=$(mktemp -d)
TMP_ZIP="${TMP_DIR}/openethereum.zip"

echo "Downloading ${DOWNLOAD_URL}"
curl --fail -L ${DOWNLOAD_URL} > ${TMP_ZIP}
unzip ${TMP_ZIP} -d ${TMP_DIR}
mv ${TMP_DIR}/openethereum ${HOMEDIR}/openethereum
chmod +x ${HOMEDIR}/openethereum

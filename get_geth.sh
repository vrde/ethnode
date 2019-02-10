#!/bin/bash
# WARNING: the following script has a high concentration of YOLOs

ETHNODE_HOME=${HOME}/.ethnode
mkdir -p ${ETHNODE_HOME}

PLATFORM=$(uname | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

VERSION=$(curl -s https://api.github.com/repos/ethereum/go-ethereum/releases/latest | python -c "import sys, json; print(json.load(sys.stdin)['tag_name'])")
COMMIT=$(curl -s https://api.github.com/repos/ethereum/go-ethereum/commits/${VERSION} | python -c "import sys, json; print(json.load(sys.stdin)['sha'])")
NAME="geth-${PLATFORM}-amd64-${VERSION:1}-${COMMIT:0:8}"
DOWNLOAD_URL="https://gethstore.blob.core.windows.net/builds/${NAME}.tar.gz"
curl ${DOWNLOAD_URL} | tar xzf - ${NAME}/geth -O > ${ETHNODE_HOME}/geth
chmod +x ${ETHNODE_HOME}/geth

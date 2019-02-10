#!/bin/bash
# This is a modified version of https://get.parity.io/, Copyright 2015-2018
# Parity Technologies (UK) Ltd.

ETHNODE_HOME=${HOME}/.ethnode
ORIGINAL_SOURCE=$(curl -s https://get.parity.io/)
VERSION_STABLE=$(echo "${ORIGINAL_SOURCE}" | grep 'VERSION_STABLE=' | grep -oE '[0-9.]+')
VERSION_BETA=$(echo "${ORIGINAL_SOURCE}" | grep 'VERSION_BETA=' | grep -oE '[0-9.]+')

RELEASE="beta"
ARCH=$(uname -m)
VANITY_SERVICE_URL="https://vanity-service.parity.io/parity-binaries?architecture=$ARCH&format=markdown"

check_os() {
  if [ "$(uname)" = "Linux" ] ; then
    PKG="linux"   # linux is my default

  elif [ "$(uname)" = "Darwin" ] ; then
    PKG="darwin"
    echo "Running on Apple"
  else
    echo "Unknown operating system"
    echo "Please select your operating system"
    echo "Choices:"
    echo "	     linux - any linux distro"
    echo "	     darwin - MacOS"
    read PKG
  fi
}

get_package() {
  if [ "$RELEASE" = "beta" ]; then
    LOOKUP_URL="$VANITY_SERVICE_URL&os=$PKG&version=v$VERSION_BETA"
  elif [ "$RELEASE" = "stable" ]; then
    LOOKUP_URL="$VANITY_SERVICE_URL&os=$PKG&version=v$VERSION_STABLE"
  fi

  echo ${LOOKUP_URL}

  MD=$(curl -Ss ${LOOKUP_URL} | grep -v sha256 | grep " \[parity\]")
  DOWNLOAD_FILE=$(echo $MD | grep -oE 'https://[^)]+')
}

install() {
  TMPDIR=$(mktemp -d) && cd $TMPDIR
  curl -S -O $DOWNLOAD_FILE
  check_sha256
  mkdir -p ${ETHNODE_HOME}
  cp $TMPDIR/parity ${ETHNODE_HOME} && chmod +x ${ETHNODE_HOME}/parity
}

check_sha256() {
  # how to check for sha256?
  SHA256_CHECK=$(which sha256sum 2> /dev/null)
  if [[ -z $SHA256_CHECK ]] ; then
    # no sha256sum? try with rhash ...
    SHA256_CHECK=$(which rhash 2> /dev/null)
    SHA256_CHECK="$SHA256_CHECK --sha256"
  fi

  if [ "$PKG" = "darwin" ] ; then
    SHA256_CHECK="shasum -a 256"
  fi

  # see if we can call the binary to calculate sha256 sums
  if ! ($SHA256_CHECK --version &> /dev/null) then
    echo "Unable to check SHA256 checksum, please install sha256sum or rhash binary"
    cleanup
    exit 1
  fi

  # $SHA256_CHECK $TMPDIR/$DOWNLOAD_FILE
  IS_CHECKSUM=$($SHA256_CHECK $TMPDIR/parity | awk '{print $1}')
  MUST_CHECKSUM=$(curl -sS $LOOKUP_URL | grep ' \[parity\]' | awk '{print $NF'})
  # debug # echo -e "is checksum:\t $IS_CHECKSUM"
  # debug # echo -e "must checksum:\t $MUST_CHECKSUM"
  if [[ $IS_CHECKSUM != $MUST_CHECKSUM ]]; then
    echo "SHA256 Checksum missmatch, aboarding installation"
    cleanup
    exit 1
  fi
}

cleanup() {
  rm $TMPDIR/*
  rmdir $TMPDIR
}

## MAIN ##

## curl installed?
which curl &> /dev/null
if [[ $? -ne 0 ]] ; then
  echo '"curl" binary not found, please install and retry'
  exit 1
fi
##

check_os
get_package
install
cleanup

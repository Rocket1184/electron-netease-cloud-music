#!/bin/bash

# environment variables needed:
# S3_ENDPOINT S3_BUCKET S3_ACCESS_KEY S3_SECRET_KEY

# arguments: 
# - mode: pull_request, push, tag

BUILD_MODE="${1:-push}"

# variables
APP_NAME="Electron NCM"
PKG_NAME="electron-netease-cloud-music"
ARTIFACT_NAME="electron-ncm"
PLATFORMS=(linux darwin)
VERSION_HASH=$(git rev-parse --short HEAD)
PKG_VER="$VERSION_HASH"
MINIO_CLIENT="node_modules/.bin/minio-client"

# functions
build_dist() {
    yarn run dist
}

describe_version() {
    local PKGJSON TMPFILE
    PKGJSON=dist/package.json
    TMPFILE=$(mktemp)
    PKG_VER=$(git describe --long)
    jq -cM ".version=\"$PKG_VER\"" "$PKGJSON" > "$TMPFILE"
    mv -f "$TMPFILE" "$PKGJSON"
    echo "Updated version in package.json: $(jq -r .version $PKGJSON)"
}

build_asar() {
    cp ./LICENSE dist/
    npx asar pack dist "build/${PKG_NAME}_${PKG_VER}.asar"
}

build_tar() {
    for PLAT in "${PLATFORMS[@]}"; do
        yarn run build "$PLAT"
        tar zcf "build/${ARTIFACT_NAME}_${PKG_VER}_${PLAT}.tar.gz" -C build "${APP_NAME}-${PLAT}-x64"
    done
}

minio_client_init() {
    if [ -z "$S3_ACCESS_KEY" ] || [ -z "$S3_SECRET_KEY" ] ; then
        echo "S3_ACCESS_KEY or S3_SECRET_KEY secrets not set"
        exit 1
    fi
    if [ ! -x "$MINIO_CLIENT" ] ; then
        curl --silent -Lo "$MINIO_CLIENT" --create-dirs --compressed "https://dl.min.io/client/mc/release/linux-amd64/mc"
        chmod +x "$MINIO_CLIENT"
    fi
    "$MINIO_CLIENT" --version
    # Usage: mc alias set <ALIAS> <YOUR-S3-ENDPOINT> <YOUR-ACCESS-KEY> <YOUR-SECRET-KEY> --api <API-SIGNATURE> --path <BUCKET-LOOKUP-TYPE>
    "$MINIO_CLIENT" --quiet alias set artifacts "$S3_ENDPOINT" "$S3_ACCESS_KEY" "$S3_SECRET_KEY"
}

minio_client_upload() {
    "$MINIO_CLIENT" --quiet cp "build/$1" "artifacts/$S3_BUCKET/"
}

echo "BUILD_MODE=$BUILD_MODE"

case "$BUILD_MODE" in
pull_request)
    build_dist
    describe_version
    build_asar
;;
tag)
    PKG_VER=$(git describe --tags --abbrev=0)
    build_dist
    build_asar
;;
push)
    build_dist
    describe_version
    build_asar
    build_tar
    minio_client_init
    minio_client_upload "${PKG_NAME}_${PKG_VER}.asar"
    for PLAT in "${PLATFORMS[@]}"; do
        minio_client_upload "${ARTIFACT_NAME}_${PKG_VER}_${PLAT}.tar.gz"
    done
;;
*)
    echo "unknown build mode: '$BUILD_MODE'"
    exit 1
;;
esac

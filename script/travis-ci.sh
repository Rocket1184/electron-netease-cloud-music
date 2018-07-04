#!/bin/bash

# variables
APP_NAME="electron-netease-cloud-music"
BUCKET_NAME="$APP_NAME"
VERSION_HASH="${TRAVIS_COMMIT:0:7}"
PKGVER="$VERSION_HASH"
TEMP_DIR="/tmp/ncm-build-temp_$VERSION_HASH"
QSHELL_BIN="exit 1"

# functions
pack() {
    rm dist/.gitkeep
    yarn run pack
    cp ./LICENSE dist/
    npx asar pack dist "build/${APP_NAME}_${PKGVER}.asar"
}

build() {
    PLATFORMS=(linux darwin)
    for i in ${PLATFORMS[*]}; do
        yarn run build "$i"
        echo -n "$VERSION_HASH" > "build/$APP_NAME-$i-x64/ncm_hash"
        tar zcf "electron-ncm-$i-x64-$VERSION_HASH.tar.gz" "$APP_NAME-$ARCH"
    done
}

qshell_init() {
    curl -Lo "$TEMP_DIR/qshell.zip" --create-dirs "http://devtools.qiniu.com/qshell-v2.1.9.zip"
    unzip "$TEMP_DIR/qshell.zip" -d "$TEMP_DIR/qshell"
    QSHELL_BIN="$TEMP_DIR/qshell/qshell-linux-x64"
    chmod +x "$QSHELL_BIN"
    "$QSHELL_BIN" account "$QINIU_AK" "$QINIU_SK"
    "$QSHELL_BIN" listbucket "$BUCKET_NAME" stdout
}

qshell_upload() {
    # Usage: qshell rput <Bucket> <Key> <LocalFile> [<Overwrite>] [<MimeType>] [<UpHost>] [<FileType>]
    "$QSHELL_BIN" rput "$BUCKET_NAME" "$1" "build/$1"
}

# entrypoint
if [ "$TRAVIS_BRANCH" == "$TRAVIS_TAG" ]; then
    # build is triggered by a git tag
    PKGVER="$TRAVIS_TAG"
    pack
    qshell_init
    qshell_upload build/*.asar
else
    pack
    build
    qshell_init
    qshell_upload build/*.asar
    qshell_upload build/*.tar.gz
fi

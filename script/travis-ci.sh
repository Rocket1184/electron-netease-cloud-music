#!/bin/bash

# variables
APP_NAME="Electron NCM"
PKG_NAME="electron-netease-cloud-music"
ARTIFACT_NAME="electron-ncm"
PLATFORMS=(linux darwin)
BUCKET_NAME="$PKG_NAME"
VERSION_HASH="${TRAVIS_COMMIT:0:7}"
PKG_VER="$VERSION_HASH"
QSHELL_VER="v2.4.0"
QSHELL_DIR="node_modules/.cache/qshell/$QSHELL_VER"
QSHELL_BIN="$QSHELL_DIR/bin/qshell-linux-x64-$QSHELL_VER"

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
    for PLAT in ${PLATFORMS[*]}; do
        yarn run build "$PLAT"
        tar zcf "build/${ARTIFACT_NAME}_${PKG_VER}_${PLAT}.tar.gz" -C build "${APP_NAME}-${PLAT}-x64"
    done
}

qshell_init() {
    if [ ! -x "$QSHELL_BIN" ] ; then
        curl -Lo "$QSHELL_DIR/qshell.zip" --create-dirs "http://devtools.qiniu.com/qshell-linux-x64-${QSHELL_VER}.zip"
        unzip "$QSHELL_DIR/qshell.zip" -d "$QSHELL_DIR/bin"
        chmod +x "$QSHELL_BIN"
    fi
    # Usage: qshell account [--overwrite | -w]<Your AccessKey> <Your SecretKey> <Your Account Name>
    "$QSHELL_BIN" account "$QINIU_AK" "$QINIU_SK" default
    # Usage: qshell listbucket2 [--prefix <Prefix> | --suffixes <suffixes1,suffixes2>] [--start <StartDate>] [--max-retry <RetryCount>][--end <EndDate>] <Bucket> [--readable] [ [-a] -o <ListBucketResultFile>]
    "$QSHELL_BIN" listbucket2 --readable "$BUCKET_NAME"
}

qshell_upload() {
    # Usage: qshell rput <Bucket> <Key> <LocalFile> [<Overwrite>] [<MimeType>] [<UpHost>] [<FileType>]
    "$QSHELL_BIN" rput "$BUCKET_NAME" "$1" "build/$1"
}

# entrypoint
if [ "$TRAVIS_BRANCH" == "$TRAVIS_TAG" ]; then
    # build is triggered by a git tag
    PKG_VER="$TRAVIS_TAG"
    build_dist
    build_asar
else
    build_dist
    describe_version
    build_asar
    build_tar
    qshell_init
    qshell_upload "${PKG_NAME}_${PKG_VER}.asar"
    for PLAT in ${PLATFORMS[*]}; do
        qshell_upload "${ARTIFACT_NAME}_${PKG_VER}_${PLAT}.tar.gz"
    done
fi

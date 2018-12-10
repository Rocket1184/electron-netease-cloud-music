#!/bin/bash

# variables
APP_NAME="Electron NCM"
PKG_NAME="electron-netease-cloud-music"
ARTIFACT_NAME="electron-ncm"
PLATFORMS=(linux darwin)
BUCKET_NAME="$PKG_NAME"
VERSION_HASH="${TRAVIS_COMMIT:0:7}"
PKG_VER="$VERSION_HASH"
QSHELL_VER="v2.3.4"
QSHELL_DIR="node_modules/.cache/qshell/${QSHELL_VER}"
QSHELL_BIN="${QSHELL_DIR}/bin/qshell_linux_x64"

# functions
update_ver_hash() {
    TMPFILE=$(mktemp)
    jq -cM ".version += \"-git.${VERSION_HASH}\"" package.json > "${TMPFILE}"
    mv -f "${TMPFILE}" package.json
    echo "Building for $(jq -r .version package.json)"
}

dist() {
    rm dist/.gitkeep
    yarn run dist
    cp ./LICENSE dist/
    npx asar pack dist "build/${PKG_NAME}_${PKG_VER}.asar"
}

build() {
    for PLAT in ${PLATFORMS[*]}; do
        yarn run build "${PLAT}"
        tar zcf "build/${ARTIFACT_NAME}-${PLAT}-x64_${PKG_VER}.tar.gz" -C build "${APP_NAME}-${PLAT}-x64"
    done
}

qshell_init() {
    if [ ! -x "$QSHELL_BIN" ] ; then
        curl -Lo "${QSHELL_DIR}/qshell.zip" --create-dirs "http://devtools.qiniu.com/qshell-${QSHELL_VER}.zip"
        unzip "${QSHELL_DIR}/qshell.zip" -d "${QSHELL_DIR}/bin"
        chmod +x "$QSHELL_BIN"
    fi
    # Usage: qshell account [--overwrite | -w]<Your AccessKey> <Your SecretKey> <Your Account Name>
    "$QSHELL_BIN" account "$QINIU_AK" "$QINIU_SK" default
    # Usage: qshell listbucket [--prefix <Prefix>] <Bucket> [-o <ListBucketResultFile>]
    "$QSHELL_BIN" listbucket "$BUCKET_NAME"
}

qshell_upload() {
    # Usage: qshell rput <Bucket> <Key> <LocalFile> [<Overwrite>] [<MimeType>] [<UpHost>] [<FileType>]
    "$QSHELL_BIN" rput "$BUCKET_NAME" "$1" "build/$1"
}

# entrypoint
if [ "$TRAVIS_BRANCH" == "$TRAVIS_TAG" ]; then
    # build is triggered by a git tag
    PKG_VER="$TRAVIS_TAG"
    dist
else
    update_ver_hash
    dist
    build
    qshell_init
    qshell_upload "${PKG_NAME}_${PKG_VER}.asar"
    for PLAT in ${PLATFORMS[*]}; do
        qshell_upload "${ARTIFACT_NAME}-${PLAT}-x64_${PKG_VER}.tar.gz"
    done
fi

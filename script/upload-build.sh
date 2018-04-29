#!/bin/bash

cd build || exit 1
curl https://dn-devtools.qbox.me/2.1.5/qshell-linux-x64 -o qshell
chmod +x qshell
./qshell account "$QINIU_AK" "$QINIU_SK"

APP_NAME=electron-netease-cloud-music
BUCKET_NAME=$APP_NAME
NCM_RELEASE_CHANNEL=master
VERSION_HASH=$(git rev-parse --short HEAD)

./qshell listbucket $BUCKET_NAME stdout

for ARCH in linux-x64 darwin-x64
do
    echo -n "$VERSION_HASH" > "$APP_NAME-$ARCH/ncm_hash"
    TAR_NAME="electron-ncm-$ARCH-$VERSION_HASH.tar.gz"
    tar zcf "$TAR_NAME" "$APP_NAME-$ARCH"
    ./qshell rput "$BUCKET_NAME" "$TAR_NAME" "$TAR_NAME"
done

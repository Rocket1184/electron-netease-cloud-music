#!/bin/sh

cd dist
wget http://devtools.qiniu.com/qshell-v2.0.5.zip -O qshell.zip
unzip qshell.zip qshell_linux_amd64
./qshell_linux_amd64 account $QINIU_AK $QINIU_SK
./qshell_linux_amd64 account

export APP_NAME=electron-netease-cloud-music
export BUCKET_NAME=$APP_NAME-dev

for ARCH in linux-x64 darwin-x64
do
    export TAR_NAME=$ARCH.tar.gz
    tar zcf $TAR_NAME $APP_NAME-$ARCH
    ./qshell_linux_amd64 rput $BUCKET_NAME $TAR_NAME $TAR_NAME
done

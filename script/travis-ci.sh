#!/bin/bash

export NODE_ENV=production

pack() {
    rm dist/.gitkeep
    yarn run pack
    cp ./LICENSE dist/
    npx asar pack dist build/app.asar
}

build() {
    PLATFORMS=(linux darwin)
    for i in ${PLATFORMS[*]}; do
        yarn run build "$i"
    done
}

if pack && build; then
    script/upload-build.sh
else
    exit 1
fi

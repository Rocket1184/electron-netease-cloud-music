#!/bin/bash

export NODE_ENV=production

pack() {
    npm run pack
}

build() {
    PLATFORMS=(linux darwin)
    for i in ${PLATFORMS[*]}; do
        npm run build $i
    done
}

if pack && build; then
    script/upload-build.sh
else
    exit 1
fi

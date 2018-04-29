#!/bin/bash

export NODE_ENV=production

tag() {
    VER=$(jq --raw-output .version package.json)
    HASH=$(git rev-parse --short HEAD)
    git config --local user.name "rocka"
    git config --local user.email "i@rocka.me"
    git tag "$VER-$HASH"
}

pack() {
    rm dist/.gitkeep
    yarn run pack
    npx asar pack dist build/app.asar
}

build() {
    PLATFORMS=(linux darwin)
    for i in ${PLATFORMS[*]}; do
        yarn run build "$i"
    done
}

if pack && build; then
    tag
    script/upload-build.sh
else
    exit 1
fi

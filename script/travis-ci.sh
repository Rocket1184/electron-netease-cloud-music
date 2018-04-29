#!/bin/bash

export NODE_ENV=production

tag() {
    VER=$(git rev-parse --short HEAD)
    HASH=$(git log --format=%h -1)
    git config --local user.name "rocka"
    git config --local user.email "i@rocka.me"
    git tag "v$VER-$HASH"
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

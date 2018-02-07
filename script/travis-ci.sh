#!/bin/bash

export NODE_ENV=production
npm run pack

if [ $? -eq "0" ] then
    npm run build linux
    npm run build darwin
else
    exit 1
fi

if [ $? -eq "0" ] then
    ./upload-build.sh
fi

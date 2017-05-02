#!/bin/sh
yarn install
cd app/
yarn install
cd ..
export NODE_ENV=production
export NCM_RELEASE_CHANNEL=dev
npm run pack
npm run build linux
npm run build darwin

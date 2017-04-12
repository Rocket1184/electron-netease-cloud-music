#!/bin/sh
yarn install
cd app/
yarn install
cd ..
export NODE_ENV=production
npm run pack
npm run build linux
npm run build darwin

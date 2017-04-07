#!/bin/sh
yarn install
cd app/
yarn install
cd ..
npm run pack
npm run build linux
npm run build darwin

#!/bin/sh
yarn install
cd app/
yarn install
cd ..
npm run build

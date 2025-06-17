#!/usr/bin/env bash
# use `bash`` rather than `sh``
export NVM_DIR=$HOME/.nvm;
source $NVM_DIR/nvm.sh;

nvm use
git pull
pm2 stop moyu-notice
npm run start

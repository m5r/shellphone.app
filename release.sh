#!/usr/bin/env sh

/app/node_modules/.bin/blitz prisma migrate deploy
/app/node_modules/.bin/quirrel ci

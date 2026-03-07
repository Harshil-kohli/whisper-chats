#!/bin/sh
npm install
cd server && bun install
cd ..
npm run build

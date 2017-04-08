#!/bin/sh

echo "deploying ..."

echo "cleaning previouse build files ..."
rm -rf ./dist

echo "building ..."
npm run build || exit 0

echo "copying ..."

cp ./package.json ./dist/package.json
cp ./._npmignore ./dist/.npmignore

perl -pi -w -e 's/"prepublishOnly": "exit 1"/"prepublishOnly": ""/g;' ./dist/package.json

cd ./dist

echo "publishing ..."

if ! [ -z "$1" ]
then
  npm publish --tag $1
else
  npm publish
fi

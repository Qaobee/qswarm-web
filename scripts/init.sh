#!/usr/bin/env bash
rm -fr node_modules
rm -fr bower_components
npm install
bower install
gulp serve
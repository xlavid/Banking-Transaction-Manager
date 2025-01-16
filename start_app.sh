#!/usr/bin/env bash

docker pull node:20.11.1-alpine3.19
docker pull nginx:1.25.4-alpine

docker build -t banking-app .
docker run -d --name banking-app -p 3000:80 banking-app:latest

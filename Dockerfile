# ---- Base Node ----
FROM node:16 AS base
# Create app directory
WORKDIR /app
COPY . .
# ---- Dependencies ----
FROM base AS dependencies

# install app dependencies including
RUN npm install
# ---- Copy Files/Build ----
FROM dependencies AS build

ARG API_URL=https://api.chronas.org/v1
ARG APPLICATIONINSIGHTS_KEY=placeholder

RUN perl -pi.back -e "s|https\:\/\/api.chronas.org\/v1|$API_URL|g" src/properties.js
RUN perl -pi.back -e "s|##AppInsightsKey##|$APPLICATIONINSIGHTS_KEY|g" src/index.html

RUN cat src/properties.js

# move the dist folder to an nginx container to run them
RUN npm run build
FROM nginx:alpine AS release
COPY --from=build /app/dist/ /usr/share/nginx/html

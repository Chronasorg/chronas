# ---- Base Node ----
FROM public.ecr.aws/lambda/nodejs:10 AS base
# Create app directory
WORKDIR /app
# ---- Dependencies ----
FROM base AS dependencies
COPY package.json ./
COPY package-lock.json ./
# install app dependencies including
RUN npm install
# ---- Copy Files/Build ----
FROM dependencies AS build
WORKDIR /app
COPY . /app

ARG API_URL=https://api.chronas.org
ARG APPLICATIONINSIGHTS_KEY=placeholder

RUN perl -pi.back -e "s|http\:\/\/localhost\:4040|$API_URL|g" src/properties.js
RUN perl -pi.back -e "s|##AppInsightsKey##|$APPLICATIONINSIGHTS_KEY|g" src/index.html


# move the dist folder to an nginx container to run them
RUN npm run build
FROM public.ecr.aws/nginx/nginx:1.21-alpine AS release
COPY --from=build /app/dist/ /usr/share/nginx/html

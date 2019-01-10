# ---- Base Node ----
FROM node:8 AS base
# Create app directory
WORKDIR /app
# ---- Dependencies ----
FROM base AS dependencies  
COPY package.json ./
# install app dependencies including 
RUN npm install
# ---- Copy Files/Build ----
FROM dependencies AS build  
WORKDIR /app
COPY . /app
# Build the app
RUN npm run build

FROM nginx:alpine AS release  

COPY --from=build /app/dist/ /usr/share/nginx/html
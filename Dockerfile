FROM sinet/nginx-node:latest
 
# Install and build the application
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN npm install \
    && npm run build
 
COPY default.conf /etc/nginx/conf.d/
 
CMD ["nginx", "-g", "daemon off;"]
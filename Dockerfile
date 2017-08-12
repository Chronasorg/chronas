FROM sinet/nginx-node:latest
 
# Install and build the application
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN npm install \
    && npm run build
 
 # copy the config 
COPY default.conf /etc/nginx/conf.d/
 
 #run ngingx on port 80
CMD ["nginx", "-g", "daemon off;"]
FROM sinet/nginx-node:latest
 
# Install and build the application
COPY dist /usr/src/app/
 
 # copy the config 
COPY default.conf /etc/nginx/conf.d/
 
 #run ngingx on port 80
CMD ["nginx", "-g", "daemon off;"]
#!/bin/bash

gitrepo=https://github.com/aumanjoa/chronas.git
token=
webappname=chronasNew$RANDOM
branch=dev

# Create a resource group.
az group create --location westeurope --name myResourceGroup

# Create an App Service plan in `FREE` tier.
az appservice plan create --name $webappname --resource-group myResourceGroup --sku S1

# Create a web app.
az webapp create --name $webappname --resource-group myResourceGroup --plan $webappname

az webapp config appsettings set --name $webappname --resource-group myResourceGroup --settings NODE_ENV=development

#enable full logging for the webapp
az webapp log config --name $webappname --resource-group myResourceGroup  \
--application-logging true  \
--detailed-error-messages true  \
--failed-request-tracing true  \
--level verbose  \
--web-server-logging filesystem

# Browse to the web app.
az webapp browse --name $webappname --resource-group myResourceGroup
#!/bin/bash
webappname=chronasNew$RANDOM

# Create a resource group.
az group create --location westeurope --name chronasWinWebAppResourceGroup

# Create an App Service plan in `FREE` tier.
az appservice plan create --name $webappname --resource-group chronasWinWebAppResourceGroup --sku S1

# Create a web app.
az webapp create --name $webappname --resource-group chronasWinWebAppResourceGroup --plan $webappname

#enable full logging for the webapp
az webapp log config --name $webappname --resource-group chronasWinWebAppResourceGroup  \
--application-logging true  \
--detailed-error-messages true  \
--failed-request-tracing true  \
--level verbose  \
--web-server-logging filesystem

# Browse to the web app.
az webapp browse --name $webappname --resource-group chronasWinWebAppResourceGroup
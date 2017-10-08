#!/bin/bash
webappname=chronasDev
resourceGroupName=chronasDev

# Create a resource group.
az group create --location westeurope --name $resourceGroupName

# Create an App Service plan
az appservice plan create --name $webappname --resource-group $resourceGroupName --sku S1

# Create a web app.
az webapp create --name $webappname --resource-group $resourceGroupName --plan $webappname

#enable full logging for the webapp
az webapp log config --name $webappname --resource-group $resourceGroupName  \
--application-logging true  \
--detailed-error-messages true  \
--failed-request-tracing true  \
--level verbose  \
--web-server-logging filesystem

# Browse to the web app.
az webapp browse --name $webappname --resource-group $resourceGroupName
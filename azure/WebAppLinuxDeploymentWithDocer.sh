#/bin/bash

# Variables
appName="AppServiceLinuxDocker$random"
dockerHubContainerPath="aumanjoa/chronas"

# Create a Resource Group
az group create --name chronasLinuxWebAppResourceGroup --location westeurope

# Create an App Service Plan
az appservice plan create --name AppServiceLinuxDockerPlan --resource-group chronasLinuxWebAppResourceGroup --location westeurope --is-linux --sku S1

# Create a Web App
az webapp create --name $appName --plan AppServiceLinuxDockerPlan --resource-group chronasLinuxWebAppResourceGroup

az webapp log config --name $appName --resource-group chronasLinuxWebAppResourceGroup  \
--application-logging true  \
--detailed-error-messages true  \
--failed-request-tracing true  \
--level verbose  \
--web-server-logging filesystem

# Configure Web App with a Custom Docker Container from Docker Hub
az webapp config container set --docker-custom-image-name $dockerHubContainerPath --name $appName --resource-group chronasLinuxWebAppResourceGroup

az webapp browse --name $webappname --resource-group myResourceGroup

az group create --name containertesting --location westeurope

#deploying the chronas azure container
az container create --name chronascontainer --image aumanjoa/chronas --resource-group containertesting --ip-address public
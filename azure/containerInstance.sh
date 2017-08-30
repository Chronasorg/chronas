
az group create --name chronas-container --location westeurope

#deploying the chronas azure container
az container create --name chronascontainer --image aumanjoa/chronas-map --resource-group chronas-container --ip-address public
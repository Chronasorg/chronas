#!/bin/bash

# Create a resource group.
az group create --name myResourceGroupDocker --location westeurope

# Create a new virtual machine, this creates SSH keys if not present.
az vm create --resource-group myResourceGroupDocker --name myVM --image UbuntuLTS --generate-ssh-keys

# Open port 80 to allow web traffic to host.
az vm open-port --port 80 --resource-group myResourceGroupDocker --name myVM

# Install Docker and start container.
az vm extension set \
  --resource-group myResourceGroupDocker \
  --vm-name myVM \
  --name DockerExtension \
  --publisher Microsoft.Azure.Extensions \
  --version 1.1 \
--settings '{"docker": {"port": "2375"},"compose": {"web": {"image": "aumanjoa/chronas","ports": ["80:3000"]}}}'
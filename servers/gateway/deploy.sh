# LOCAL DEPLOYMENT

# Call build script to rebuild API server Linux executable and API docker container image
sh build.sh

docker rm -f photogateway

# Add network?
docker run \
--name photogateway \
knasu13/photogateway

# Push API server Docker container image to Docker Hub
# docker push knasu13/photogateway

# SSH into EC2 instance and redirect output of update.sh into VM
# update.sh includes removing current container, pulling updated container image and running new container image
# ssh -i ~/.ssh/KDellLaptop.pem ec2-user@ec2-52-89-162-18.us-west-2.compute.amazonaws.com 'bash -s' < update.sh
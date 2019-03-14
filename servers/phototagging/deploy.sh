sh build.sh


# --network privDocker \
docker run -d \
-e MONGO_INITDB_DATABASE=mongoDB \
--name mongocontainer \
mongo

# docker run -d \
# --hostname my-rabbit \
# --name rabbitcontainer \
# --network privDocker \
# rabbitmq:3-management

# EC2's /photos --> container's /photos...
# Using root / instead so i don't need to create a folder beforehand
# If run locally and give root, what would be mounted into the container?
docker run -d \
-v /:/ \
--name phototaggingcontainer \
knasu13/phototagging
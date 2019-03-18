docker rm -f mongocontainer
docker rm -f phototaggingcontainer

rm -f ./photos/*

docker pull knasu13/tag

# docker volume create --name photosvolume
# mkdir /photos

docker run -d \
-e MONGO_INITDB_DATABASE=mongoDB \
--network privNet \
--name mongocontainer \
mongo


# EC2's / --> container's /photos...
# If run locally and give root, what would be mounted into the container?
docker run -d \
-p 80:80 \
-v ~/photos:/photos \
--network privNet \
--name phototaggingcontainer \
knasu13/phototagging
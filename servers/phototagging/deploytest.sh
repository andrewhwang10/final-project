sh build.sh

docker rm -f mongocontainer
docker rm -f phototaggingcontainer


# ERROR
docker run -d \
-p 8080:8080 \
-e MONGO_INITDB_DATABASE=mongoDB \
--name mongocontainer \
mongo


docker run -d \
-p 4000:4000 \
--name phototaggingcontainer \
knasu13/phototagging

# -v ~/go/src/final-project/servers/phototagging/photos:/photos \
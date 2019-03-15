docker volume prune -f 

docker rm -f mongocontainer
docker rm -f phototaggingcontainer
docker network rm privNet

docker pull knasu13/phototagging

docker network create privNet

# IN GATEWAY
# export TLSCERT=/etc/letsencrypt/live/tag.karinasu.me/fullchain.pem
# export TLSKEY=/etc/letsencrypt/live/tag.karinasu.me/privkey.pem
# export PHOTOTAGGINGADDR="phototaggingcontainer:80"

docker run -d \
-e MONGO_INITDB_DATABASE=mongoDB \
--network privNet \
--name mongocontainer \
mongo

# docker run -d \
# --hostname my-rabbit \
# --name rabbitcontainer \
# --network privDocker \
# rabbitmq:3-management

# EC2's / --> container's /photos...
# If run locally and give root, what would be mounted into the container?
docker run -d \
-p 80:80 \
-v /:/photos \
--network privNet \
--name phototaggingcontainer \
knasu13/phototagging

# IN GATEWAY
# -e PHOTOTAGGINGADDR=$PHOTOTAGGINGADDR \
# -e TLSCERT=$TLSCERT \
# -e TLSKEY=$TLSKEY \
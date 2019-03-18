docker volume prune -f 

docker network rm privNet
docker network create privNet

docker rm -f gatewaycontainer
docker rm -f userscontainer
docker rm -f sessionscontainer
docker rm -f phototaggingcontainer
docker rm -f mongocontainer

docker pull knasu13/taggateway
docker pull knasu13/tagusers
docker pull knasu13/tag

docker network create privNet

export TLSCERT=/etc/letsencrypt/live/tag.karinasu.me/fullchain.pem
export TLSKEY=/etc/letsencrypt/live/tag.karinasu.me/privkey.pem
export REDISCLIENT="sessionscontainer"
export REDISADDR="$REDISCLIENT:6379"
# export MYSQL_ROOT_PASSWORD=$(openssl rand -base64 18)
export MYSQL_ROOT_PASSWORD="MAKERANDOMLATER"
export DSN="root:$MYSQL_ROOT_PASSWORD@tcp(userscontainer:3306)/userDB"
export SESSIONKEY="sessionkeywoohoo"
export PHOTOSADDR="phototaggingcontainer:80"
export ADDR=":443"

docker run -d \
-e MONGO_INITDB_DATABASE=mongoDB \
--network privNet \
--name mongocontainer \
mongo

docker run -d \
-v ~/photos:/photos \
--network privNet \
--name phototaggingcontainer \
knasu13/tag

docker run -d \
--name userscontainer \
--network privNet \
-e MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD \
-e MYSQL_DATABASE=userDB \
knasu13/tagusers

sleep 25

docker run -d \
--name sessionscontainer \
--network privNet \
redis

# docker run -d \
# --hostname my-rabbit \
# --name rabbitcontainer \
# --network privDocker \
# rabbitmq:3-management

# Double-check why mount letsencrypt...
docker run -d \
--network privNet \
--name gatewaycontainer \
-p 443:443 \
-e ADDR=$ADDR \
-e TLSCERT=$TLSCERT \
-e TLSKEY=$TLSKEY \
-e REDISADDR=$REDISADDR \
-e DSN=$DSN \
-e SESSIONKEY=$SESSIONKEY \
-e PHOTOTAGGINGADDR=$PHOTOSADDR \
-v /etc/letsencrypt/:/etc/letsencrypt/:ro \
knasu13/taggateway
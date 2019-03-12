# LOCAL DEPLOYMENT

# Call build script to rebuild API server Linux executable and API docker container image
sh build.sh

# docker rm -f CONTAINERNAME

# Add network later when in ec2
# docker run \
# --name CONTAINERNAME \
# IMAGENAME
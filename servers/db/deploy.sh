sh build.sh
docker push knasu13/tagusers
ssh -i ~/.ssh/KDellLaptop.pem ec2-user@ec2-35-163-68-8.us-west-2.compute.amazonaws.com 'bash -s' < update.sh
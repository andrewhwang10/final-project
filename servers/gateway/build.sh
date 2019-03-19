GOOS=linux go build
docker build -t knasu13/taggateway .
docker build -t knasu13/tagusers ../db
go clean
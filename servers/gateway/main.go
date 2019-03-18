package main

/***  STARTER CODE FROM: https://zupzup.org/go-http-file-upload-download/  ***/

import (
	"database/sql"
	"log"
	"net/http"
	"net/http/httputil"
	"os"
	"time"

	"github.com/go-redis/redis"
	"github.com/info441/final-project/servers/gateway/handlers"
	"github.com/info441/final-project/servers/gateway/models/sessions"
	"github.com/info441/final-project/servers/gateway/models/users"
)

func failOnError(err error, msg string) {
	if err != nil {
		log.Fatalf("%s: %s", msg, err)
	}
}

func getEnvironmentVariable(key string) string {
	val, set := os.LookupEnv(key)
	if !set {
		log.Fatalf("%s environment variable is not set", key)
	}
	return val
}

func main() {
	// Retrieve and store environment variables
	addr := getEnvironmentVariable("ADDR")
	photosaddr := getEnvironmentVariable("PHOTOSADDR")
	tlscert := getEnvironmentVariable("TLSCERT")
	tlskey := getEnvironmentVariable("TLSKEY")
	sessionkey := getEnvironmentVariable("SESSIONKEY")
	redisaddr := getEnvironmentVariable("REDISADDR")
	dsn := getEnvironmentVariable("DSN")

	// Redis Server
	rdb := redis.NewClient(&redis.Options{
		Addr:     redisaddr,
		Password: "",
		DB:       0,
	})
	_, err := rdb.Ping().Result()
	failOnError(err, "Error pinging redis database")
	rs := sessions.NewRedisStore(rdb, 150*time.Second)

	// mySQL Server
	db, err := sql.Open("mysql", dsn)
	failOnError(err, "Error opening a new SQL database")
	err = db.Ping()
	failOnError(err, "Error pinging database")
	log.Printf("Successfully connected to SQL database!\n")
	ms := users.NewMySQLStore(db)

	hc := handlers.HandlerContext{
		SigningKey:   sessionkey,
		SessionStore: rs,
		UserStore:    ms,
	}

	photosProxy := &httputil.ReverseProxy{Director: hc.CustomDirector(photosaddr)}
	mux := http.NewServeMux()

	mux.HandleFunc("/users", hc.UsersHandler)
	mux.HandleFunc("/sessions", hc.SessionsHandler)
	mux.HandleFunc("/sessions/", hc.SpecificSessionHandler)
	mux.Handle("/photos", photosProxy)
	mux.Handle("/tags", photosProxy)

	// PROXY to phototagging microservice mux.HandleFunc("/upload", handlers.UploadFileHandler)

	wrappedMux := handlers.NewHeaderCors(mux)

	log.Print("Server started on localhost:8080, use /upload for uploading files and /files/{fileName} for downloading")
	log.Fatal(http.ListenAndServeTLS(addr, tlscert, tlskey, wrappedMux))
}

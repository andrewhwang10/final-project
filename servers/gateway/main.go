package main

/***  STARTER CODE FROM: https://zupzup.org/go-http-file-upload-download/  ***/

import (
	"database/sql"
	"final-project/servers/gateway/handlers"
	"final-project/servers/gateway/models/sessions"
	"final-project/servers/gateway/models/users"
	"fmt"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"time"

	"github.com/go-redis/redis"
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
	photosAddr := getEnvironmentVariable("PHOTOSADDR")
	tlsCert := getEnvironmentVariable("TLSCERT")
	tlsKey := getEnvironmentVariable("TLSKEY")
	sessionKey := getEnvironmentVariable("SESSIONKEY")
	redisAddr := getEnvironmentVariable("REDISADDR")
	dsn := getEnvironmentVariable("DSN")

	// Redis Server
	rdb := redis.NewClient(&redis.Options{
		Addr: redisAddr,
	})

	_, err := rdb.Ping().Result()
	failOnError(err, "Error pinging redis database")
	rs := sessions.NewRedisStore(rdb, time.Hour)

	// mySQL Server
	db, err := sql.Open("mysql", dsn)
	failOnError(err, "Error opening a new SQL database")
	err = db.Ping()
	failOnError(err, "Error pinging database")
	log.Printf("Successfully connected to SQL database!\n")
	ms := users.NewMySQLStore(db)

	hc := handlers.HandlerContext{
		SigningKey:   sessionKey,
		SessionStore: rs,
		UserStore:    ms,
	}

	photosURL, errParse := url.Parse(fmt.Sprintf("http://%s", photosAddr))
	fmt.Printf("photosURL: %v\n", photosURL)
	if errParse != nil {
		fmt.Printf("Error parsing photosURL: %v\n", errParse)
	}
	photosProxy := &httputil.ReverseProxy{Director: hc.CustomDirector(photosURL)}
	mux := http.NewServeMux()

	mux.HandleFunc("/users", hc.UsersHandler)
	mux.HandleFunc("/sessions", hc.SessionsHandler)
	mux.HandleFunc("/sessions/", hc.SpecificSessionHandler)

	mux.Handle("/photos", photosProxy)
	mux.Handle("/photos/", photosProxy)
	mux.Handle("/tags", photosProxy)
	mux.Handle("/tags/", photosProxy)

	wrappedMux := handlers.NewHeaderCors(mux)

	log.Print("Server is listening at: %s", addr)
	log.Fatal(http.ListenAndServeTLS(addr, tlsCert, tlsKey, wrappedMux))
}

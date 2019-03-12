package main

/***  STARTER CODE FROM: https://zupzup.org/go-http-file-upload-download/  ***/

import (
	"final-project/servers/gateway/handlers"
	"log"
	"net/http"
)

func main() {
	mux := http.NewServeMux()

	// PROXY to phototagging microservice mux.HandleFunc("/upload", handlers.UploadFileHandler)

	wrappedMux := handlers.NewHeaderCors(mux)

	log.Print("Server started on localhost:8080, use /upload for uploading files and /files/{fileName} for downloading")
	log.Fatal(http.ListenAndServe(":8080", wrappedMux))
}

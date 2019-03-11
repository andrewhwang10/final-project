package main

/***  STARTER CODE FROM: https://zupzup.org/go-http-file-upload-download/  ***/

import (
	"final-project/servers/gateway/handlers"
	"log"
	"net/http"
)

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/upload", handlers.UploadFileHandler)

	fs := http.FileServer(http.Dir(handlers.UploadPath))
	mux.Handle("/files/", http.StripPrefix("/files", fs))

	wrappedMux := handlers.NewHeaderCors(mux)

	log.Print("Server started on localhost:8080, use /upload for uploading files and /files/{fileName} for downloading")
	log.Fatal(http.ListenAndServe(":8080", wrappedMux))
}

package main

/***  STARTER CODE FROM: https://zupzup.org/go-http-file-upload-download/  ***/

import (
	"crypto/rand"
	"fmt"
	"io/ioutil"
	"log"
	"mime"
	"net/http"
	"os"
	"path/filepath"
)

const maxUploadSize = 2 * 1024 * 1024 // 2 mb
const uploadPath = "./photos"         // Directory that photos will be saving into

const fileTooBig = "FILE TOO BIG"
const invalidFile = "INVALID FILE"
const invalidFileType = "INVALID FILE TYPE"
const cantWriteFile = "CAN'T WRITE FILE"
const cantReadFileType = "CAN'T READ FILE TYPE"
const success = "SUCCESS"

func main() {
	http.HandleFunc("/upload", UploadFileHandler)

	fs := http.FileServer(http.Dir(uploadPath))
	http.Handle("/files/", http.StripPrefix("/files", fs))

	log.Print("Server started on localhost:8080, use /upload for uploading files and /files/{fileName} for downloading")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

// UploadFileHandler handles uploading files to the server
func UploadFileHandler(w http.ResponseWriter, r *http.Request) {
	// validate file size
	r.Body = http.MaxBytesReader(w, r.Body, maxUploadSize)
	if err := r.ParseMultipartForm(maxUploadSize); err != nil {
		renderError(w, fileTooBig, http.StatusBadRequest)
		return
	}

	// Useful tip (for uploading multiple photos): "To access multiple values of the same key, call ParseForm and then inspect Request.Form directly."

	// In Postman, set key to "type" and value to MIME file type of attachment (https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types#Image_types)
	fileType := r.PostFormValue("type")
	fmt.Printf("fileType: %v\n", fileType)

	// In Postman, get file from "uploadFile" form field
	file, _, err := r.FormFile("uploadFile")
	if err != nil {
		renderError(w, invalidFile, http.StatusBadRequest)
		return
	}
	fmt.Print("Past r.FormFile! \n")
	defer file.Close()
	fileBytes, err := ioutil.ReadAll(file)
	if err != nil {
		renderError(w, invalidFile, http.StatusBadRequest)
		return
	}
	fmt.Print("Past ReadAll! \n")

	// check file type, detectcontenttype only needs the first 512 bytes
	filetype := http.DetectContentType(fileBytes)
	if filetype != "image/jpeg" && filetype != "image/jpg" &&
		filetype != "image/gif" && filetype != "image/png" {
		renderError(w, invalidFileType, http.StatusBadRequest)
		return
	}

	// switch filetype {
	// case "image/jpeg", "image/jpg":
	// case "image/gif", "image/png":
	// case "application/pdf":
	// 	break
	// default:
	// 	renderError(w, invalidFileType, http.StatusBadRequest)
	// 	return
	// }

	fileName := randToken(12)
	// ExtensionsByType are all possible extentions for file type
	fileEndings, err := mime.ExtensionsByType(fileType)
	if err != nil {
		renderError(w, cantReadFileType, http.StatusInternalServerError)
		return
	}
	newPath := filepath.Join(uploadPath, fileName+fileEndings[0])
	fmt.Printf("FileType: %s, File: %s\n", fileType, newPath)

	// write file to newPath
	newFile, err := os.Create(newPath)
	if err != nil {
		renderError(w, cantWriteFile, http.StatusInternalServerError)
		fmt.Printf("ERROR in os.Create: %v\n", err)
		return
	}
	defer newFile.Close() // idempotent, okay to call twice
	if _, err := newFile.Write(fileBytes); err != nil || newFile.Close() != nil {
		renderError(w, cantWriteFile, http.StatusInternalServerError)
		fmt.Printf("ERROR in newFile.Write: %v\n", err)
		return
	}
	w.Write([]byte(success))
}

func renderError(w http.ResponseWriter, message string, statusCode int) {
	w.WriteHeader(http.StatusBadRequest)
	w.Write([]byte(message))
}

func randToken(len int) string {
	b := make([]byte, len)
	rand.Read(b)
	return fmt.Sprintf("%x", b)
}

package handlers

import (
	"crypto/rand"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"mime"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
)

const maxUploadSize = 4 * 1024 * 1024 // 4 mb
const UploadPath = "./photos"         // Directory that photos will be saving into

const parseFormFail = "PARSE FORM FAILED"
const fileTooBig = "FILE TOO BIG"
const invalidFile = "INVALID FILE"
const invalidFileType = "INVALID FILE TYPE"
const cantWriteFile = "CAN'T WRITE FILE"
const cantReadFileType = "CAN'T READ FILE TYPE"
const success = "SUCCESS"

type PhotoUploaded struct {
	Path string
	File *os.File
}

func NewPhotoUploaded() *PhotoUploaded {
	return &PhotoUploaded{}
}

// UploadFileHandler handles uploading files to the server
func UploadFileHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("INSIDE UPLOAD FILE HANDLER: %v", r.Body)
	// validate file size
	// fmt.Printf("%v", r.Body)
	r.Body = http.MaxBytesReader(w, r.Body, maxUploadSize)
	if err := r.ParseMultipartForm(maxUploadSize); err != nil {
		renderError(w, fileTooBig, http.StatusBadRequest)
		return
	}

	fmt.Printf("r.Body: %v\n", r.Body)
	fmt.Printf("r.Method: %v\n", r.Method)

	// Already called witin FormValue; probably not necessary but used r.Form for debugging
	errParseForm := r.ParseMultipartForm(maxUploadSize)
	if errParseForm != nil {
		renderError(w, parseFormFail, http.StatusBadRequest)
		return
	}

	fmt.Printf("r.Body: %v\n", r.Body)
	fmt.Printf("r.Multi: %v\n", r.MultipartForm)

	uploadedFilesMap := r.MultipartForm.File
	var uploadedFiles []multipart.File
	for key, value := range uploadedFilesMap {
		fmt.Println("key: ", key, "Value: ", value)
		for _, val := range value {
			fmt.Println("val: ", val.Filename)
			file, err := val.Open()
			if err != nil {
				fmt.Printf("Error opening %s: %v\n", val.Filename, err)
			} else {
				uploadedFiles = append(uploadedFiles, file)
				defer file.Close()
			}
		}
	}
	fmt.Printf("uploadedFiles: %v\n", uploadedFiles)

	// In Postman, set key to "type" and value to MIME file type of attachment (https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types#Image_types)
	// Previously: PostFormValue
	fileType := r.FormValue("type")
	fmt.Printf("fileType: %v\n", fileType)

	var photosToUpload []*PhotoUploaded

	for _, file := range uploadedFiles {
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

		fileName := randToken(12)
		// ExtensionsByType are all possible extentions for file type
		fileEndings, err := mime.ExtensionsByType(fileType)
		fmt.Printf("fileEndings: %v\n", fileEndings)
		fmt.Printf("fileType: %v\n", fileType)
		if err != nil {
			renderError(w, cantReadFileType, http.StatusInternalServerError)
			return
		}
		newPath := filepath.Join(UploadPath, fileName+fileEndings[0])
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

		fmt.Println(success)
		photoUploaded := NewPhotoUploaded()
		photoUploaded.File = newFile // File param in response is empty?
		photoUploaded.Path = newPath
		photosToUpload = append(photosToUpload, photoUploaded)
	}

	fmt.Printf("photosToUpload: %v\n", photosToUpload)

	w.Header().Add("Access-Control-Allow-Origin", "*") // Done in cors.go but this is still needed to avoid browser error?
	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode(photosToUpload); err != nil {
		http.Error(w, "Error encoding photoUploaded struct into JSON: %v\n", http.StatusInternalServerError)
		return
	}
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

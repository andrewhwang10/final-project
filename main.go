package main

import (
	"fmt"
	"io"
	"net/http"
	"os"
)

func main() {
	http.HandleFunc("/", UploadPhoto)
	http.Handle("/resources/", http.StripPrefix("/resources", http.FileServer(http.Dir("./assets"))))
	http.ListenAndServe(":4000", nil)
}

func UploadPhoto(w http.ResponseWriter, r *http.Request) {
	fmt.Printf("Method: %v", r.Method)

	fn := ""

	if r.Method == http.MethodPost {
		f, h, err := r.FormFile("photo")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer f.Close()

		fn = h.Filename

		fmt.Println("\nfile: ", f, "\nheader: ", h, "\nerr: ", err)

		// bs, err := ioutil.ReadAll(f)
		// if err != nil {
		// 	http.Error(w, err.Error(), http.StatusInternalServerError)
		// 	return
		// }
		df, err := os.Create("/assets/" + fn)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer df.Close()

		_, err = io.Copy(df, f)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	io.WriteString(w, `
	<form method="POST" enctype="multipart/form-data">
	<input type="file" name="photo">
	<br>
	<input type="submit" value="Submit">
	  </form>
	  <br>
	<img src=`+fn+`/>`)
}

/*

const maxUploadSize = 2 * 1024 * 1024 // 2 mb
const uploadPath = "./photos"
const FileTooBig = "FILE TOO BIG"
const InvalidFile = "INVALID FILE"
const InvalidFileType = "INVALID FILE TYPE"
const CantWriteFile = "CAN'T WRITE FILE"
const CantReadFileType = "CAN'T READ FILE TYPE"
const Success = "SUCCESS"



func main() {
	http.HandleFunc("/upload", uploadFileHandler())

	fs := http.FileServer(http.Dir(uploadPath))
	http.Handle("/files/", http.StripPrefix("/files", fs))

	log.Print("Server started on localhost:8080, use /upload for uploading files and /files/{fileName} for downloading")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func uploadFileHandler() http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// validate file size
		r.Body = http.MaxBytesReader(w, r.Body, maxUploadSize)
		if err := r.ParseMultipartForm(maxUploadSize); err != nil {
			renderError(w, FileTooBig, http.StatusBadRequest)
			return
		}

		// parse and validate file and post parameters
		// "To access multiple values of the same key, call ParseForm and then inspect Request.Form directly."
		fileType := r.PostFormValue("type")
		file, _, err := r.FormFile("uploadFile")
		if err != nil {
			renderError(w, InvalidFile, http.StatusBadRequest)
			return
		}
		defer file.Close()
		fileBytes, err := ioutil.ReadAll(file)
		if err != nil {
			renderError(w, InvalidFile, http.StatusBadRequest)
			return
		}

		// check file type, detectcontenttype only needs the first 512 bytes
		filetype := http.DetectContentType(fileBytes)
		if filetype != "image/jpeg" && filetype != "image/jpg" &&
			filetype != "image/gif" && filetype != "image/png" {
			renderError(w, "INVALID_FILE_TYPE", http.StatusBadRequest)
			return
		}


		// switch filetype {
		// case "image/jpeg", "image/jpg":
		// case "image/gif", "image/png":
		// case "application/pdf":
		// 	break
		// default:
		// 	renderError(w, InvalidFileType, http.StatusBadRequest)
		// 	return
		// }


		fileName := randToken(12)
		fileEndings, err := mime.ExtensionsByType(fileType)
		if err != nil {
			renderError(w, CantReadFileType, http.StatusInternalServerError)
			return
		}
		newPath := filepath.Join(uploadPath, fileName+fileEndings[0])
		fmt.Printf("FileType: %s, File: %s\n", fileType, newPath)

		// write file
		newFile, err := os.Create(newPath)
		if err != nil {
			renderError(w, CantWriteFile, http.StatusInternalServerError)
			return
		}
		defer newFile.Close() // idempotent, okay to call twice
		if _, err := newFile.Write(fileBytes); err != nil || newFile.Close() != nil {
			renderError(w, CantWriteFile, http.StatusInternalServerError)
			return
		}
		w.Write([]byte(Success))
	})
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
*/

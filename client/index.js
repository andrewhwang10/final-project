const PHOTOS_UPLOADED = document.querySelector("#photosUploaded")
const PHOTOS_FLEX = PHOTOS_UPLOADED.querySelector("#photosFlex")
const TAG_FORM = /** @type {HTMLInputElement} */(document.querySelector("#tagForm"));
const PHOTO_FORM = /** @type {HTMLInputElement} */(document.querySelector("#photoForm"));

const BASE_URI = "http://localhost:443"

TAG_FORM.addEventListener("submit", onSubmit)
PHOTO_FORM.addEventListener("submit", onSubmit);

function onSubmit(e) {
    console.log("Processing submit...")
    e.preventDefault();
    if(e.target.id == "photoForm") {
        uploadPhoto();
    } else if(e.target.id == "tagForm") {
        createTag();
    }
}

function uploadPhoto() {
    console.log("In uploadPhoto");
    var formData = new FormData(PHOTO_FORM);
    files = formData.getAll("file");
    
    var params = {
        method: "POST",
        body: formData,
        mode: 'cors'//,
        // headers:{ // Error when go run main.go (req. headers); Without it in docker, error (405 and not 200)
        //     'Access-Control-Allow-Origin': '*'
        //     //'Access-Control-Allow-Methods': 'GET, PUT, POST, PATCH, DELETE'
        // }
    }
    fetch(BASE_URI + "/photos", params)
        .then(response => {
            if (!response.ok) {
                errorHttp = document.createElement("p")
                errorHttp.textContent = "HTTP error, status = " + response.status
                PHOTOS_UPLOADED.append(errorHttp)
                throw new Error('HTTP error, status = ' + response.status);
            }
            return response.json()
        })
        .then(r => {
            console.log("Success: ", r) // File param is empty

            for (i = 0; i < r.length; i++) {
                imageDiv = document.createElement("div")
                imageDiv.classList.add("col-sm-6", "col-md-4", "col-lg-3", "col-xl-2", "d-flex", "flex-wrap")

                // Error: Relative path doesn't work
                // Error: Absolute path works but "Not allowed to load local resource"
                // image.src = "C:\\Users\\knasu\\go\\src\\final-project\\photos\\c189a873fb8cae1060638ea6.png"
                // Use URL to test appending to HTML
                image = document.createElement("img")
                image.src = "https://cdn0.tnwcdn.com/wp-content/blogs.dir/1/files/2018/02/google-pacman-796x419.jpg"
                image.classList.add("img-thumbnail")
                
                imageDiv.appendChild(image)
                PHOTOS_FLEX.appendChild(imageDiv)
            }
        })
        .catch(function(err) {
            console.log(err)
        });

}

function createTag() {
    console.log("In createTag");
    var formData = new FormData(TAG_FORM);
    text = formData.get("textInput")
}

function sendData() {
    console.log("In sendData!!!")
    var formData = new FormData(FORM)

    files = formData.getAll("uploadFile")
    console.log(files)

    var params = {
        method: "POST",
        body: formData,
        mode: 'cors'//,
        // headers:{ // Error when go run main.go (req. headers); Without it in docker, error (405 and not 200)
        //     'Access-Control-Allow-Origin': '*'
        //     //'Access-Control-Allow-Methods': 'GET, PUT, POST, PATCH, DELETE'
        // }
    }

    fetch("http://localhost:8080/upload", params)
        .then(response => {
            if (!response.ok) {
                errorHttp = document.createElement("p")
                errorHttp.textContent = "HTTP error, status = " + response.status
                PHOTOS_UPLOADED.append(errorHttp)
                throw new Error('HTTP error, status = ' + response.status);
            }
            return response.json()
        })
        .then(r => {
            console.log("Success: ", r) // File param is empty

            for (i = 0; i < r.length; i++) {
                imageDiv = document.createElement("div")
                imageDiv.classList.add("col-sm-6", "col-md-4", "col-lg-3", "col-xl-2", "d-flex", "flex-wrap")

                // Error: Relative path doesn't work
                // Error: Absolute path works but "Not allowed to load local resource"
                // image.src = "C:\\Users\\knasu\\go\\src\\final-project\\photos\\c189a873fb8cae1060638ea6.png"
                // Use URL to test appending to HTML
                image = document.createElement("img")
                image.src = "https://cdn0.tnwcdn.com/wp-content/blogs.dir/1/files/2018/02/google-pacman-796x419.jpg"
                image.classList.add("img-thumbnail")
                
                imageDiv.appendChild(image)
                PHOTOS_FLEX.appendChild(imageDiv)
            }
        })
        .catch(function(err) {
            console.log(err)
        });
}
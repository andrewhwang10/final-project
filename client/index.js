const PHOTOS_UPLOADED = document.querySelector("#photosUploaded")
const PHOTOS_FLEX = PHOTOS_UPLOADED.querySelector("#photosFlex")
const TAG_FORM = /** @type {HTMLInputElement} */(document.querySelector("#tagForm"));
const PHOTO_FORM = /** @type {HTMLInputElement} */(document.querySelector("#photoForm"));

var params = {
    method: "POST",
    mode: 'cors'//,
    // headers:{ // Error when go run main.go (req. headers); Without it in docker, error (405 and not 200)
    //     'Access-Control-Allow-Origin': '*'
    //     //'Access-Control-Allow-Methods': 'GET, PUT, POST, PATCH, DELETE'
    // }
}
const BASE_URI = "https://tag.karinasu.me"

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

function createAlert(success, action, parentElement) {
    elem = document.createElement("div");
    elem.classList.add("alert")
    if(success) {
        elem.classList.add("alert-success")
        elem.textContent = "Successful " + action + "!";
    } else {
        elem.classList.add("alert-danger")
        elem.textContent = "Unsuccessful " + action + ".";
        
    }
    parentElement.append(elem);
}

function uploadPhoto() {
    console.log("In uploadPhoto");
    var formData = new FormData(PHOTO_FORM);
    params.body = formData;
    params.headers["Authorization"] = sessionStorage.getItem('sessionID');

    fetch(BASE_URI + "/photos", params)
        .then(response => {
            createAlert(response.ok, "photo upload", PHOTO_FORM)
            if (!response.ok) {
                throw new Error('HTTP error, status = ' + response.status);
            }
            return response.json()
        })
        .then(r => {
            console.log("Success: ", r); // File param is empty
            renderPhotos(r);
        })
        .catch(function(err) {
            console.log(err)
        });

}

function createTag() {
    console.log("In createTag");
    var formData = new FormData(TAG_FORM);
    text = formData.get("textInput");
    params.body = formData;
    params.headers["Authorization"] = sessionStorage.getItem('sessionID');

    fetch(BASE_URI + "/photos", params)
        .then(response => {
            if (!response.ok) {
                errorHttp = document.createElement("p")
                errorHttp.textContent = "HTTP error, status = " + response.status
                PHOTOS_UPLOADED.append(errorHttp)
                throw new Error('HTTP error, status = ' + response.status);
            } else {
                successHTTP = document.createElement("div");
                successHTTP.textContent = ""
            }
            return response.json();
        })
        .then(r => {
            console.log("Success: ", r) // File param is empty
        })
        .catch(function(err) {
            console.log(err)
        });

}

function renderPhotos(r) {
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
}
const PHOTOS_UPLOADED = document.querySelector("#photosUploaded")
const PHOTOS_FLEX = PHOTOS_UPLOADED.querySelector("#photosFlex")
const TAG_FORM = document.querySelector("#tagForm");
const PHOTO_FORM = document.querySelector("#photoForm");

var params = {
    method: "POST",
    mode: 'cors'
}

window.onload = getPhotos();

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
    params.headers = {};
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
        image.src = "data:image/png;base64," + r[i].body;
        image.classList.add("img-thumbnail")
        
        imageDiv.appendChild(image)
        PHOTOS_FLEX.appendChild(imageDiv)
    }
}

function getPhotos() {
    console.log(sessionStorage.getItem("sessionID"));   
    var headers = {
        Authorization: sessionStorage.getItem("sessionID")
    }
    var params = {
        method: "GET",
        mode: "cors",
        headers: headers
    }
    fetch(BASE_URI + "/photos", params)
    .then(response => {
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
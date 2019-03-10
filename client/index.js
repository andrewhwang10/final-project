const PHOTOS_UPLOADED = document.querySelector("#photosUploaded")
const FORM = /** @type {HTMLInputElement} */(document.querySelector("#form"));
// FORM.addEventListener("submit", OnSubmit)

FORM.addEventListener("submit", OnSubmit);

function OnSubmit(e) {
    console.log("In OnSubmit!!!")
    e.preventDefault();
    sendData();
}

function sendData() {
    console.log("In sendData!!!")
    var formData = new FormData(FORM)
    // console.log("formData: " + formData.keys())
    for (var key of formData.keys()) {
        // console.log("key: " + key + "; value: " + formData.get(key));
        console.log(formData.get(key)); 
    }

    var params = {
        method: "POST",
        body: formData,
        mode: 'cors'
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
            photoObj = JSON.stringify(r)
            console.log("Success: ", photoObj) // File param is empty
            console.log("r.Path: " + r.Path)

            image = document.createElement("img")

            // Error: Relative path doesn't work
            // Error: Absolute path works but "Not allowed to load local resource"
            // image.src = "C:\\Users\\knasu\\go\\src\\final-project\\photos\\c189a873fb8cae1060638ea6.png"
            // Use URL to test appending to HTML
            image.src = "https://cdn0.tnwcdn.com/wp-content/blogs.dir/1/files/2018/02/google-pacman-796x419.jpg"
            PHOTOS_UPLOADED.appendChild(image)
        })
        .catch(function(err) {
            console.log(err)
        });
}
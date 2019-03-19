const TAG_BAR = document.querySelector("#tagsBar");
const PHOTOS_UPLOADED = document.querySelector("#photosUploaded");
const TAG_FORM = document.querySelector("#tagForm");
const PHOTO_FORM = document.querySelector("#photoForm");
const TAG_DATA_MODAL = document.querySelector("#tagDataModal");

var params = {
    method: "POST",
    mode: 'cors'
}

window.onload = () => {
    if(sessionStorage.getItem("sessionID") == null) {
        window.location.assign("login.html");
    } else {
        getPhotos();
        getTags();
    }
}

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
    parentElement.prepend(elem);
}

function uploadPhoto() {
    console.log("In uploadPhoto");
    var formData = new FormData(PHOTO_FORM);
    var params = {
        method: "POST",
        mode: 'cors',
        headers: {}
    }
    params.body = formData;
    params.headers = {};
    params.headers["Authorization"] = sessionStorage.getItem('sessionID');

    fetch(BASE_URI + "/photos", params)
        .then(response => {
            createAlert(response.ok, "photo upload", PHOTO_FORM)
            if (!response.ok) {
                throw new Error('HTTP error, status = ' + response.status + '\n' + response.statusText);
            }
            return response.json()
        })
        .then(r => {
            console.log("Success: ", r); // File param is empty
            window.location.reload();
        })
        .catch(function(err) {
            console.log(err)
        });

}

function createTag() {
    console.log("In createTag");
    var formData = new FormData(TAG_FORM);
    text = formData.get("textInput");
    var params = {
        method: "POST",
        mode: 'cors',
        headers: {}
    }
    params.body = formData;
    params.headers["Authorization"] = sessionStorage.getItem('sessionID');

    fetch(BASE_URI + "/tags", params)
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
            window.location.reload();
        })
        .catch(function(err) {
            console.log(err)
        });

}

function renderPhotos(r) {
    for (i = 0; i < r.length; i++) {
        card = document.getElementById("tmp-card").cloneNode(true);
        card.setAttribute("id", "");
        card.setAttribute("data-photo-id", r[i].photoID);
        card.setAttribute("data-photo-likes", r[i].likes);
        card.querySelector('.card-img-top').src = "data:image/png;base64," + r[i].data;
        cardBody = card.querySelector('.card-body')
        icon = card.querySelector('.fa-heart')
        r[i].tags.forEach(tag => {
            tagBadge = document.createElement("span");
            tagBadge.classList.add("badge", "badge-pill", "badge-primary");
            tagBadge.innerHTML = tag;
            cardBody.appendChild(tagBadge);
        });
        userID = sessionStorage.getItem('userID');
        renderLikes(card, r[i]);
        row = document.createElement("div");
        row.classList.add("row");
        row.classList.add("card-row")
        row.appendChild(card);
        PHOTOS_UPLOADED.appendChild(row)
    }
}

function getTags() {
    var params = {
        method: "GET",
        mode: "cors"
    }
    params.headers = {};
    params.headers["Authorization"] = sessionStorage.getItem("sessionID");
    fetch(BASE_URI + "/tags", params)
    .then(response => {
        console.log(response);
        if (!response.ok) {
            throw new Error('HTTP error, status = ' + response.status + '\n' + response.body);
        }
        return response.json();
    })
    .then(r => {
        console.log("Success: ", r); // File param is empty
        renderTagsBar(r);
    })
    .catch(function(err) {
        console.log(err)
    });
}

function renderTagsBar(r) {
    for (i = 0; i < r.length; i++) {
        tag = document.getElementById("tmp-tag").cloneNode(true);
        tag.setAttribute("data-tag-id", r[i]._id);
        tag.setAttribute("data-tag-name", r[i].name);
        tag.setAttribute("data-tag-members", r[i].members)
        tag.querySelector("a").innerHTML = r[i].name;
        TAG_BAR.querySelector(".card-body").appendChild(tag);
        if(sessionStorage.getItem("userID") != r[i].creator) {
           tag.querySelector("i").style.display = "none";
        }
    }
}

function getPhotosByTag(tag) {
    console.log("In getPhotosByTag");
    console.log(tag);
    var params = {
        method: "GET",
        mode: 'cors',
        headers: {}
    }
    params.headers["Authorization"] = sessionStorage.getItem('sessionID');

    fetch(BASE_URI + "/photos/" + tag.getAttribute("data-tag-id"), params)
        .then(response => {
            if (!response.ok) {
                throw new Error('HTTP error, status = ' + response.status + '\n' + response.statusText);
            }
            return response.json()
        })
        .then(r => {
            console.log("Success: ", r); // File param is empty
            PHOTOS_UPLOADED.innerHTML = "";
            renderPhotos(r);
        })
        .catch(function(err) {
            console.log(err)
        });
}

function getPhotos() {
    console.log(sessionStorage.getItem("sessionID"));   
    var params = {
        method: "GET",
        mode: "cors"
    }
    params.headers = {};
    params.headers["Authorization"] = sessionStorage.getItem("sessionID");
    fetch(BASE_URI + "/photos", params)
    .then(response => {
        console.log(response);
        if (!response.ok && !response.status == 422) {
            throw new Error('HTTP error, status = ' + response.status + '\n' + response.body);
        } else if (response.status == 403) {
            window.location.replace("login.html")
        }
        return response.json();
    })
    .then(r => {
        console.log("Success: ", r); // File param is empty
        renderPhotos(r);
    })
    .catch(function(err) {
        console.log(err)
    });

}

function like(card) {
    console.log("In like");
    params.headers = {};
    params.headers["Authorization"] = sessionStorage.getItem('sessionID');

    fetch(BASE_URI + "/photos/" + card.getAttribute("data-photo-id"), params)
        .then(response => {
            createAlert(response.ok, "photo upload", PHOTO_FORM)
            if (!response.ok) {
                throw new Error('HTTP error, status = ' + response.status + '\n' + response.statusText);
            }
            return response.json()
        })
        .then(r => {
            console.log("Success: ", r); // File param is empty
            renderLikes(card, r);
        })
        .catch(function(err) {
            console.log(err)
        });
}

function renderLikes(card, r) {
    card.setAttribute("data-photo-likes", r.likes);
    icon = card.querySelector('.fa-heart');
    userID = sessionStorage.getItem('userID');
    console.log(userID);
    if(r.likes.includes(userID)) {
        icon.classList.remove("far");
        icon.classList.add("fas");
        icon.classList.add("liked");
    } else {
        icon.classList.remove("fas");
        icon.classList.add("far");
        icon.classList.remove("liked");
    }
    icon.parentNode.querySelector(".likes-count").innerHTML =  r.likes.length + " likes";
}

function addTag(card) {
    tagName = card.querySelector("input").value;
    availableTags = Array.from(TAG_BAR.querySelector(".card-body").children);
    availableTags.forEach((tag) => {
        console.log(tag)
        if(tag.getAttribute("data-tag-name") == tagName) {
            var params = {
                method: "POST",
                mode: 'cors',
                headers: {}
            }
            params.headers["Authorization"] = sessionStorage.getItem('sessionID');
        
            fetch(BASE_URI + "/photos/" + card.getAttribute("data-photo-id") + "/" + tag.getAttribute("data-tag-id"), params)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('HTTP error, status = ' + response.status + '\n' + response.statusText);
                    }
                    return response.json()
                })
                .then(r => {
                    console.log("Success: ", r); // File param is empty
                    window.location.reload();
                })
                .catch(function(err) {
                    console.log(err)
                });
        }
    });

}

function signout() {
    sessionStorage.clear();
    window.location.assign('login.html');
}

function showTagData(tag) {
    $("#tagDataModal").modal("show");
    TAG_DATA_MODAL.querySelector("#tagDataModalTitle").innerHTML = "#" + tag.getAttribute("data-tag-name");
    TAG_DATA_MODAL.setAttribute("data-tag-id", tag.getAttribute("data-tag-id"));
    TAG_DATA_MODAL.setAttribute("data-tag-members", tag.getAttribute("data-tag-members"));
}

function deleteTag(tag) {
    console.log("In deleteTag");
    var params = {
        method: "DELETE",
        mode: 'cors',
        headers: {}
    }
    params.headers["Authorization"] = sessionStorage.getItem('sessionID');

    fetch(BASE_URI + "/tags/" + tag.getAttribute("data-tag-id"), params)
        .then(response => {
            if (!response.ok) {
                throw new Error('HTTP error, status = ' + response.status + '\n' + response.statusText);
            }
        })
        .then(r => {
            console.log("Successfully deleted tag: " + tag.getAttribute("data-tag-name")); // File param is empty
            window.location.reload();
        })
        .catch(function(err) {
            console.log(err)
        });

}
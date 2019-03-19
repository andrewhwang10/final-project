<<<<<<< HEAD
const LOGIN_FORM = /** @type {HTMLInputElement} */(document.querySelector("#loginForm"));
const SIGNUP_FORM = /** @type {HTMLInputElement} */(document.querySelector("#signupForm"));
const BASE_URI = "http://localhost:443"
const headerAuthorization = "Authorization";

var params = {
    method: "POST",
    mode: 'cors'//,
    // headers:{ // Error when go run main.go (req. headers); Without it in docker, error (405 and not 200)
    //     'Access-Control-Allow-Origin': '*'
    //     //'Access-Control-Allow-Methods': 'GET, PUT, POST, PATCH, DELETE'
    // }
}

LOGIN_FORM.addEventListener("submit", login);
SIGNUP_FORM.addEventListener("submit", signUp);

=======
const LOGIN_FORM = document.getElementById("loginForm");
const SIGNUP_FORM = document.getElementById("signupForm");

var params = {
    method: "POST",
   // mode: 'cors',
    headers: { // Error when go run main.go (req. headers); Without it in docker, error (405 and not 200)
        //'Access-Control-Allow-Origin': '*',
        //'Access-Control-Allow-Methods': 'GET, PUT, POST, PATCH, DELETE'
        "content-type": "application/json"
    }
}

LOGIN_FORM.addEventListener("submit", login);
SIGNUP_FORM.addEventListener("submit",  signUp)
>>>>>>> client

function login(e) {
    e.preventDefault();
    console.log("logging in...");
<<<<<<< HEAD
    var data = JSON.stringify(LOGIN_FORM.serializeArray());
    params.body = data;
=======
    
    var data = new FormData(LOGIN_FORM);
    params.body = JSON.stringify(makeJSONObject(data));
>>>>>>> client

    fetch(BASE_URI + "/sessions", params)
    .then(response => {
        if (!response.ok) {
<<<<<<< HEAD
            throw new Error('HTTP error, status = ' + response.status);
        }
=======
            createAlert(false, "login", LOGIN_FORM);
            throw new Error('HTTP error, status = ' + response.status);
        }
        sid = response.headers.get(headerAuthorization);
        sessionStorage.setItem('sessionID', sid);
>>>>>>> client
        return response.json()
    })
    .then(r => {
        console.log("Success: ", r); // File param is empty
<<<<<<< HEAD
        sid = r.Headers.get(headerAuthorization)
        sessionStorage.setItem('sessionID', sid);
=======
        sessionStorage.setItem('userID', r.id);
        window.location.replace("index.html");
>>>>>>> client
    })
    .catch(function(err) {
        console.log(err)
    });
}

function signUp(e) {
    e.preventDefault();
    console.log("signing up...");
<<<<<<< HEAD
    var data = JSON.stringify(SIGNUP_FORM.serializeArray());
    params.body = data;
=======
    
    var data = new FormData(SIGNUP_FORM);
    console.log(makeJSONObject(data));
    params.body = JSON.stringify(makeJSONObject(data));
>>>>>>> client

    fetch(BASE_URI + "/users", params)
    .then(response => {
        if (!response.ok) {
<<<<<<< HEAD
            throw new Error('HTTP error, status = ' + response.status);
        }
=======
            createAlert(false, "sign up", SIGNUP_FORM);
            throw new Error('HTTP error, status = ' + response.status);
        }
        sid = response.headers.get(headerAuthorization);
        sessionStorage.setItem('sessionID', sid);
>>>>>>> client
        return response.json()
    })
    .then(r => {
        console.log("Success: ", r); // File param is empty
<<<<<<< HEAD
        sid = r.Headers.get(headerAuthorization)
        sessionStorage.setItem('sessionID', sid);
=======
        sessionStorage.setItem('userID', r.id);
        window.location.replace("index.html");
>>>>>>> client
    })
    .catch(function(err) {
        console.log(err)
    });
<<<<<<< HEAD
=======
}


function makeJSONObject(formData) {
    var object = {};
    formData.forEach(function(value, key){
        object[key] = value;
    });
    return object;
>>>>>>> client
}
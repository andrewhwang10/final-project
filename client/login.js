const LOGIN_FORM = document.getElementById("loginForm");
const SIGNUP_FORM = document.getElementById("signupForm");

var params = {
    method: "POST",
    mode: 'cors',
    headers: { // Error when go run main.go (req. headers); Without it in docker, error (405 and not 200)
        //'Access-Control-Allow-Origin': '*',
        //'Access-Control-Allow-Methods': 'GET, PUT, POST, PATCH, DELETE'
        "content-type": "application/json"
    }
}

LOGIN_FORM.addEventListener("submit", login);
SIGNUP_FORM.addEventListener("submit",  signUp)


function login(e) {
    e.preventDefault();
    console.log("logging in...");
    
    var data = new FormData(LOGIN_FORM);
    params.body = JSON.stringify(makeJSONObject(data));

    fetch(BASE_URI + "/sessions", params)
    .then(response => {
        if (!response.ok) {
            throw new Error('HTTP error, status = ' + response.status);
        }
        sid = response.headers.get(headerAuthorization);
        sessionStorage.setItem('sessionID', sid);
        return response.json()
    })
    .then(r => {
        console.log("Success: ", r); // File param is empty
    })
    .catch(function(err) {
        console.log(err)
    });
}

function signUp(e) {
    e.preventDefault();
    console.log("signing up...");
    
    var data = new FormData(SIGNUP_FORM);
    console.log(makeJSONObject(data));
    params.body = JSON.stringify(makeJSONObject(data));

    fetch(BASE_URI + "/users", params)
    .then(response => {
        if (!response.ok) {
            throw new Error('HTTP error, status = ' + response.status);
        }
        console.log(response);
        sid = response.headers.get(headerAuthorization);
        sessionStorage.setItem('sessionID', sid);
        return response.json()
    })
    .then(r => {
        console.log("Success: ", r); // File param is empty
    })
    .catch(function(err) {
        console.log(err)
    });
}


function makeJSONObject(formData) {
    var object = {};
    formData.forEach(function(value, key){
        object[key] = value;
    });
    return object;
}
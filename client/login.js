const LOGIN_FORM = $("#loginForm");
const SIGNUP_FORM = $("#signupForm");

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


function login(e) {
    e.preventDefault();
    console.log("logging in...");
    var data = JSON.stringify(LOGIN_FORM.serializeArray());
    params.body = data;

    fetch(BASE_URI + "/sessions", params)
    .then(response => {
        if (!response.ok) {
            throw new Error('HTTP error, status = ' + response.status);
        }
        return response.json()
    })
    .then(r => {
        console.log("Success: ", r); // File param is empty
        sid = r.Headers.get(headerAuthorization)
        sessionStorage.setItem('sessionID', sid);
    })
    .catch(function(err) {
        console.log(err)
    });
}

function signUp(e) {
    e.preventDefault();
    console.log("signing up...");
    var data = JSON.stringify(SIGNUP_FORM.serializeArray());
    params.body = data;

    fetch(BASE_URI + "/users", params)
    .then(response => {
        if (!response.ok) {
            throw new Error('HTTP error, status = ' + response.status);
        }
        return response.json()
    })
    .then(r => {
        console.log("Success: ", r); // File param is empty
        sid = r.Headers.get(headerAuthorization)
        sessionStorage.setItem('sessionID', sid);
    })
    .catch(function(err) {
        console.log(err)
    });
}
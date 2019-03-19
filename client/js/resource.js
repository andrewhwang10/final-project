const BASE_URI = "https://tag.karinasu.me"
const headerAuthorization = "Authorization";

var params = {
    method: "POST",
    mode: 'cors'//,
    // headers:{ // Error when go run main.go (req. headers); Without it in docker, error (405 and not 200)
    //     'Access-Control-Allow-Origin': '*'
    //     //'Access-Control-Allow-Methods': 'GET, PUT, POST, PATCH, DELETE'
    // }
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

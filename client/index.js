const FORM = /** @type {HTMLInputElement} */(document.querySelector("#form"));
// FORM.addEventListener("submit", onSubmit)

function OnSubmit(e) {
    // e.preventDefault() // Causing error
    let reqUrl = "http://localhost:8080/upload"
    console.log("In OnSubmit!!!")
    return false
}
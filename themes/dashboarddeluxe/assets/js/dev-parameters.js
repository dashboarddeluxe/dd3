function setParameterVisibility(data) {
    var showParameter = data;
    var e = document.querySelector("#parameter-area");
    if (e.classList.contains("hidden") == showParameter) {
        e.classList.toggle("hidden");
    }
    sessionStorage.setItem("showParameter", showParameter);
}

function changeParameterVisibility() {
    var e = document.querySelector("#parameter-area");
    var showParameter = e.classList.contains("hidden") ? true : false;
    setParameterVisibility(showParameter);
}

function setupParameterIndicator() {
    /* load variables from session storage */
    var showParameter = sessionStorage.getItem("showParameter") === "true";

    setParameterVisibility(showParameter);
}

document.addEventListener('DOMContentLoaded', function() {
    setupParameterIndicator();
});
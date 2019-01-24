$(() => {
    var loginDiv = $('#loginDiv');
    var logoutDiv = $('#logoutDiv');
    var welcomeText = $('#welcomeText');

    if (sessionStorage.getItem('loginStatus')) {
        loginDiv.hide();
        welcomeText.text("Welcome," + sessionStorage.getItem("_id"));
        logoutDiv.show();
    } else {
        loginDiv.show();
        logoutDiv.hide();
    }
});

function logout() {
    $.ajax({
        type: "GET",
        url: "/logout",
        success: function () {
            sessionStorage.clear();
            window.location = '/';
        }
    });
}
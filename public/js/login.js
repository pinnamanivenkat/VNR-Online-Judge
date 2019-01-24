$(() => {
    var snackBar = $('#snackbar');
    var strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,24})");
    $('#loginForm').submit(function (e) {
        e.preventDefault();
        // var username = $('#login').val();
        // var password = $('#password').val();
        const username = "15071A05N5";
        const password = "&h3HRJ6gRU";
        if (username.length !== 10) {
            showFeedbackSnackBar("Roll Number should be of 10 characters");
        } else {
            if (password.match(strongRegex)) {
                $.ajax({
                    type: "POST",
                    url: "/login",
                    data: {
                        username,
                        password
                    },
                    success: function () {
                        window.location = '/';
                    }
                });
            } else {
                showFeedbackSnackBar("Password ins't strong enough");
            }
        }
        return false;
    });

    function showFeedbackSnackBar(x) {
        console.log(snackBar);
        snackBar.text(x);
        snackBar.addClass("snackbar_show");
        setTimeout(function () {
            snackBar.removeClass("snackbar_show");
        }, 3000);
    }
});
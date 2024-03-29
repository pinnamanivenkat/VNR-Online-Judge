$(() => {
    var snackBar = $('#snackbar');
    var strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,24})");
    $('#loginForm').submit(function (e) {
        e.preventDefault();
        var username = $('#login').val();
        var password = $('#password').val();
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
                    success: function (data) {
                        window.location = data.redirect;
                    },error: function(data) {
                        showFeedbackSnackBar("Wrong username/password");
                    }
                });
            } else {
                showFeedbackSnackBar("Password ins't strong enough");
            }
        }
        return false;
    });

    function showFeedbackSnackBar(x) {
        snackBar.text(x);
        snackBar.addClass("snackbar_show");
        setTimeout(function () {
            snackBar.removeClass("snackbar_show");
        }, 3000);
    }
});
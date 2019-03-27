$(() => {
    var snackBar = $('#snackbar');
    var rollNumRegex = /^[a-zA-Z0-9]{10}$/

    $('#createUserForm').submit(function (e) {
        e.preventDefault();
        var username = $('#username').val();
        var name = $('#name').val();
        var addUserType = $('input[name=addUserType]:checked').val();
        var rollNumCheck = username.match(rollNumRegex)

        if (rollNumCheck) {
            $.ajax({
                type: "POST",
                url: "/createUser",
                data: {
                    username,
                    name,
                    addUserType
                },
                success: function (data) {
                    if (!data.created) {
                        handleError();
                    }
                    alert(data.password);
                },
                error: handleError = function(xhr, status, error) {
                    showFeedbackSnackBar("Roll number already exists");
                }
            });
        } else if (!rollNumCheck) {
            showFeedbackSnackBar("Roll number is invalid")
        } else {
            showFeedbackSnackBar("Display name is invalid")
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

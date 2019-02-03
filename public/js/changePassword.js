$(() => {
    var strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,24})");
    $(document).ready(function () {
        var passOne = $("#passOne").val();
        var passTwo = $("#passTwo").val();
        var passThree = $("#passThree").val();
        var footerText = $("#footerText");
        var footer = $("#footer");

        footerText.html("Enter old password");

        var checkAndChange = function () {
            if (passOne.length >= 8) {
                if (passTwo.length >= 8 && passThree.length >= 8 && passTwo === passThree) {
                    footerText.html("Submit");
                    footer.removeClass("incorrect").addClass("correct");
                } else {
                    footerText.html("They don't match");
                    footer.removeClass('correct').addClass('incorrect');
                }
            } else {
                footerText.html("Enter old password");
                footer.removeClass('correct').addClass('incorrect');
            }
        }

        footer.on('click', function () {
            if (passOne.match(strongRegex) && passTwo.match(strongRegex)) {
                if (footer.is('.correct')) {
                    $.ajax({
                        type: "POST",
                        url: "/changePassword",
                        data: {
                            oldPassword: passOne,
                            newPassword: passTwo
                        },
                        success: function (data) {
                            if (data.status === 1881) {
                                alert('Password changed, redirecting');
                                window.location = '/login';
                            } else {
                                alert(data.message)
                            }
                        },
                        error: function (data) {
                            alert('Some error occured, Please try again');
                        }
                    });
                }
            } else {
                alert("password should contain atlest 1 lowercase, 1 uppercase, 1 number");
            }
        });

        $("input").keyup(function () {
            var newPassOne = $("#passOne").val();
            var newPassTwo = $("#passTwo").val();
            var newPassThree = $('#passThree').val();

            passOne = newPassOne;
            passTwo = newPassTwo;
            passThree = newPassThree;

            checkAndChange();
        });
    });
});